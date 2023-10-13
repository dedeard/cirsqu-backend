import { BadGatewayException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { StripeService } from '../../common/services/stripe.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentIntentsService {
  private readonly logger = new Logger(PaymentIntentsService.name);
  constructor(private readonly stripe: StripeService) {}

  async list(customerId: string, pagination?: Stripe.PaginationParams) {
    try {
      return await this.stripe.paymentIntents.list({ customer: customerId, ...pagination });
    } catch (error: any) {
      this.logger.error(`Failed to list payment intents for customer ${customerId}: ${error.message}`);

      throw new BadGatewayException('Unable to fetch payment intent list');
    }
  }

  async find(customerId: string, paymentIntentId: string) {
    try {
      const paymentMethod = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      if (!paymentMethod || paymentMethod?.customer !== customerId) throw new Error('Payment intent not found');
      if ('deleted' in paymentMethod) throw new Error('Payment intent has been deleted');
      return paymentMethod;
    } catch (error: any) {
      this.logger.error(`Failed to retrieve payment intent ${paymentIntentId}: ${error.message}`);

      throw new NotFoundException(error.message);
    }
  }
}
