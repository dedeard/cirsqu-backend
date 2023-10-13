import { BadGatewayException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { StripeService } from '../../common/services/stripe.service';
import Stripe from 'stripe';

@Injectable()
export class ChargesService {
  private readonly logger = new Logger(ChargesService.name);
  constructor(private readonly stripe: StripeService) {}

  async list(customerId: string, pagination?: Stripe.PaginationParams) {
    try {
      return await this.stripe.charges.list({ customer: customerId, ...pagination });
    } catch (error: any) {
      this.logger.error(`Failed to list charges for customer ${customerId}: ${error.message}`);

      throw new BadGatewayException('Unable to fetch charge list');
    }
  }

  async find(customerId: string, paymentIntentId: string) {
    try {
      const paymentMethod = await this.stripe.charges.retrieve(paymentIntentId);
      if (!paymentMethod || paymentMethod?.customer !== customerId) throw new Error('Charge not found');
      if ('deleted' in paymentMethod) throw new Error('Charge has been deleted');
      return paymentMethod;
    } catch (error: any) {
      this.logger.error(`Failed to retrieve charge ${paymentIntentId}: ${error.message}`);

      throw new NotFoundException(error.message);
    }
  }
}
