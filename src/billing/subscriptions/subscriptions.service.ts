import type { Stripe } from 'stripe';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { StripeService } from '../../common/services/stripe.service';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(private readonly stripe: StripeService) {}

  // Find an active subscription for a user
  async findActive(user: IUser) {
    const { subscription } = user.profile;

    if (subscription.lifetime?.paymentIntentStatus === 'succeeded') {
      return this.getLifetimePaymentIntent(subscription);
    }

    if (subscription.recurring?.subscriptionStatus === 'active') {
      return this.getRecurringSubscription(subscription);
    }

    throw new NotFoundException('No active subscriptions found');
  }

  // Get payment intent for lifetime subscription
  private async getLifetimePaymentIntent(subscription: any) {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(subscription.lifetime.paymentIntentId);

    if (paymentIntent.latest_charge) {
      paymentIntent.latest_charge = await this.stripe.charges.retrieve(paymentIntent.latest_charge.toString());
    }

    return paymentIntent;
  }

  // Get recurring subscription with latest invoices
  private async getRecurringSubscription(subscription: any) {
    const subs: Stripe.Subscription & { latest_invoices?: any } = await this.stripe.subscriptions.retrieve(
      subscription.recurring.subscriptionId,
    );

    subs.latest_invoices = await this.stripe.invoices.list({
      subscription: subs.id,
      expand: ['data.charge'],
    });

    return subs;
  }

  // Retrieve active subscriptions for a given user
  async find(user: IUser) {
    try {
      return await this.findActive(user);
    } catch (error: any) {
      this.logger.error(`Failed to retrieve active subscription for user ${user.uid}: ${error.message}`);
      throw new NotFoundException('Invalid user ID provided or no active subscriptions found');
    }
  }
}
