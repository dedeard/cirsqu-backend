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
    console.log(event);
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
    // Fetch the user profile by the Stripe customer ID
    const { id, data } = await this.profilesService.findByStripeCustomerId(object.customer);

    // Get the existing subscriptions or an empty array if there are none
    let subscriptions = data.subscriptions || [];

    // Update the status, cancelAt, and priceId of any subscription that matches object.id
    subscriptions = subscriptions.map((subscription) =>
      subscription.id === object.id
        ? {
            ...subscription,
            status: object.status,
            cancelAt: object.cancel_at || null,
            priceId: object?.items?.data?.[0]?.price?.id,
          }
        : subscription,
    );

    // If no existing subscription matches object.id, add a new one to the start of the array
    if (!subscriptions.find((subscription) => subscription.id === object.id)) {
      const newSubscription = {
        id: object.id,
        status: object.status,
        recurring,
        cancelAt: object.cancel_at || null,
        priceId: object?.items?.data?.[0]?.price?.id,
      };

      subscriptions = [newSubscription, ...subscriptions];
    }

    // Update the user's subscriptions in the database
    await this.profilesService.updateSubscriptions(id, subscriptions);
  }
}
