import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StripeService } from '../common/services/stripe.service';
import { ProfilesService } from '../profiles/profiles.service';
import Stripe from 'stripe';

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);

  constructor(
    private readonly stripe: StripeService,
    private readonly config: ConfigService,
    private readonly profilesService: ProfilesService,
  ) {}

  validateSignature(signature: string | Buffer, payload: string | Buffer) {
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, this.config.getOrThrow('STRIPE_WEBHOOK_SECRET'));
    } catch (error) {
      this.logger.error(error.message);
      throw new BadRequestException('Webhook signature verification failed.');
    }

    return event;
  }

  async handler(signature: string | Buffer, payload: string | Buffer) {
    const event = this.validateSignature(signature, payload);

    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.onCreateOrUpdate(event.data.object, true);
        break;

      case 'checkout.session.completed':
        await this.onSessionComplete(event.data.object);
        break;

      default:
        this.logger.warn(`Unhandled event type: ${event.type}`, event.object);
        break;
    }
  }

  async onSessionComplete(object: Record<string, any>) {
    if (object.payment_intent) {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(object.payment_intent);
      return this.onCreateOrUpdate(paymentIntent, false);
    } else if (object.subscription) {
      const subscription = await this.stripe.subscriptions.retrieve(object.subscription);
      return this.onCreateOrUpdate(subscription, true);
    }
  }

  async onCreateOrUpdate(object: Record<string, any>, recurring: boolean) {
    const { id, data } = await this.profilesService.findByStripeCustomerId(object.customer);

    const subscription = data.subscription;

    if (recurring) {
      subscription.recurring = {
        subscriptionId: object.id,
        subscriptionStatus: object.status,
      };
    } else {
      subscription.lifetime = {
        paymentIntentId: object.id,
        paymentIntentStatus: object.status,
      };
    }

    await this.profilesService.updateSubscription(id, subscription);
  }
}
