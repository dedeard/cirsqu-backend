import type { Stripe } from 'stripe';
import { BadGatewayException, BadRequestException, Injectable, Logger } from '@nestjs/common';
import { StripeService } from '../../common/services/stripe.service';
import { PaymentMethodsService } from '../payment-methods/payment-methods.service';
import { ProductsService } from '../../products/products.service';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly stripe: StripeService,
    private readonly productsService: ProductsService,
    private readonly paymentMethodsService: PaymentMethodsService,
  ) {}

  async list(customerId: string, pagination?: Stripe.PaginationParams) {
    try {
      return await this.stripe.subscriptions.list({ customer: customerId, ...pagination });
    } catch (error: any) {
      this.logger.error(`Failed to list subscriptions for customer ${customerId}: ${error.message}`);

      throw new BadGatewayException('Unable to fetch subscription list');
    }
  }

  async find(subscriptionId: string) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

      if (!subscription || 'deleted' in subscription) throw new Error('Subscription not found or has been deleted');

      return subscription;
    } catch (error: any) {
      this.logger.error(`Failed to retrieve subscription ${subscriptionId}: ${error.message}`);

      throw new BadRequestException('Invalid Subscription ID provided');
    }
  }

  async create(customerId: string, lookupKey: string) {
    try {
      const product = await this.productsService.findByLookupKey(lookupKey);
      if (!product.price.recurring) throw new BadRequestException('The selected product does not support recurring payments');

      const paymentMethodExists = await this.paymentMethodsService.exists(customerId);
      if (!paymentMethodExists) throw new BadRequestException('No valid payment method found for the user');

      return await this.stripe.subscriptions.create({
        customer: customerId,
        payment_settings: {
          payment_method_types: ['card'],
        },
        items: [{ price: product.price.id }],
        expand: ['latest_invoice.payment_intent'],
      });
    } catch (error: any) {
      this.logger.error(`Failed to create a subscription for customer ${customerId}: ${error.message}`);

      // Rethrow the same error after logging it
      throw error;
    }
  }
}
