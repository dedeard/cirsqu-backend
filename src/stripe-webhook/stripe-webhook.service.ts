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
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.onCreateOrUpdate(event.data.object, true);
        break;

      case 'payment_intent.succeeded':
      case 'payment_intent.created':
        await this.onCreateOrUpdate(event.data.object, false);
        break;

      default:
        this.logger.warn(`Unhandled event type: ${event.type}`, event.object);
        break;
    }
  }

  async onCreateOrUpdate(object: Record<string, any>, recurring: boolean) {
    const { id, data } = await this.profilesService.findByStripeCustomerId(object.customer);

    const subscription = data.subscription;

    if (recurring) {
      subscription.recurring.subscriptionId = object.id;
      subscription.recurring.subscriptionStatus = object.status;
    } else {
      subscription.lifetime.paymentIntentId = object.id;
      subscription.lifetime.paymentIntentStatus = object.status;
    }

    await this.profilesService.updateSubscription(id, subscription);
  }
}
