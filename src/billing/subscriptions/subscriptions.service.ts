import type { Stripe } from 'stripe';
import { BadGatewayException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { StripeService } from '../../common/services/stripe.service';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);
  constructor(private readonly stripe: StripeService) {}

  async list(customerId: string, pagination?: Stripe.PaginationParams) {
    try {
      return await this.stripe.subscriptions.list({ customer: customerId, ...pagination });
    } catch (error: any) {
      this.logger.error(`Failed to list subscriptions for customer ${customerId}: ${error.message}`);

      throw new BadGatewayException('Unable to fetch subscription list');
    }
  }

  async find(customerId: string, subscriptionId: string) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

      if (!subscription || subscription?.customer !== customerId) throw new Error('Subscription not found');
      if ('deleted' in subscription) throw new Error('Subscription has been deleted');

      return subscription;
    } catch (error: any) {
      this.logger.error(`Failed to retrieve subscription ${subscriptionId}: ${error.message}`);

      throw new NotFoundException('Invalid Subscription ID provided');
    }
  }
}
