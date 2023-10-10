import { BadGatewayException, BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { StripeService } from '../../common/services/stripe.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentMethodsService {
  private readonly logger = new Logger(PaymentMethodsService.name);
  constructor(private readonly stripe: StripeService) {}

  async list(customerId: string, pagination?: Stripe.PaginationParams) {
    try {
      return await this.stripe.customers.listPaymentMethods(customerId, { ...pagination });
    } catch (error: any) {
      this.logger.error(`Failed to list payment methods for customer ${customerId}: ${error.message}`);

      throw new BadGatewayException('Unable to fetch payment method list');
    }
  }

  async find(customerId: string, paymentMethodId: string) {
    try {
      const paymentMethod = await this.stripe.paymentMethods.retrieve(paymentMethodId);
      if (!paymentMethod || paymentMethod?.customer !== customerId) throw new Error('Payment method not found');
      if ('deleted' in paymentMethod) throw new Error('Payment method has been deleted');
      return paymentMethod;
    } catch (error: any) {
      this.logger.error(`Failed to retrieve payment method ${paymentMethodId}: ${error.message}`);

      throw new NotFoundException(error.message);
    }
  }

  async exists(customerId: string) {
    const paymentMethods = await this.list(customerId);
    return paymentMethods.data.length > 0;
  }

  async has(customerId: string, paymentMethodId: string): Promise<boolean> {
    try {
      const paymentMethod = await this.find(customerId, paymentMethodId);
      return !!paymentMethod;
    } catch {
      return false;
    }
  }

  async attach(customerId: string, paymentMethodId: string) {
    try {
      return await this.stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
    } catch (error) {
      this.logger.error(`Error attaching payment method ${paymentMethodId} to customer ${customerId}: `, error);
      throw error;
    }
  }

  async update(customerId: string, paymentMethodId: string, data: Stripe.PaymentMethodUpdateParams) {
    const hasPaymentMethod = await this.has(customerId, paymentMethodId);
    if (!hasPaymentMethod) {
      throw new BadRequestException(`No Payment Method found with ID ${paymentMethodId} for Customer ${customerId}`);
    }

    try {
      return await this.stripe.paymentMethods.update(paymentMethodId, data);
    } catch (error) {
      this.logger.error(`Error attaching payment method ${paymentMethodId} to customer ${customerId}: `, error);
      throw error;
    }
  }

  async detach(customerId: string, paymentMethodId: string) {
    const hasPaymentMethod = await this.has(customerId, paymentMethodId);
    if (!hasPaymentMethod) {
      throw new BadRequestException(`No Payment Method found with ID ${paymentMethodId} for Customer ${customerId}`);
    }

    try {
      return await this.stripe.paymentMethods.detach(paymentMethodId);
    } catch (error) {
      this.logger.error(`Error detaching payment method ${paymentMethodId}: `, error);
      throw error;
    }
  }
}
