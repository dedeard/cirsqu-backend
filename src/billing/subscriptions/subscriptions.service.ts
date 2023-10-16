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
      return this.stripe.paymentIntents.retrieve(subscription.lifetime.paymentIntentId, {
        expand: ['latest_charge'],
      });
    }

    if (subscription.recurring?.subscriptionStatus) {
      return this.stripe.subscriptions.retrieve(subscription.recurring.subscriptionId, {
        expand: ['latest_invoice', 'next_pending_invoice_item_invoice'],
      });
    }

    throw new NotFoundException('No active subscriptions found');
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
