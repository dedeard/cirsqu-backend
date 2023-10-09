import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { StripeService } from '../../common/services/stripe.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentMethodsService {
  private readonly logger = new Logger(PaymentMethodsService.name);
  constructor(private readonly stripe: StripeService) {}

  async list(customerId: string) {
    try {
      const { data } = await this.stripe.customers.listPaymentMethods(customerId, { type: 'card' });
      return data;
    } catch (error) {
      this.logger.error(`Error listing payment methods for customer ${customerId}: `, error);
      throw error;
    }
  }

  async first(customerId: string) {
    try {
      const paymentMethods = await this.list(customerId);
      if (paymentMethods.length === 0) {
        throw new BadRequestException(`No Payment Methods found for Customer ${customerId}`);
      }
      return paymentMethods[0];
    } catch (error) {
      this.logger.error(`Error retrieving first payment method for customer ${customerId}: `, error);
      throw error;
    }
  }

  async exists(customerId: string) {
    const paymentMethods = await this.list(customerId);
    return paymentMethods.length > 0;
  }

  async has(customerId: string, paymentMethodId: string): Promise<boolean> {
    const paymentMethods = await this.list(customerId);
    return paymentMethods.some((pm) => pm.id === paymentMethodId);
  }

  async attach(customerId: string, paymentMethodId: string) {
    if (await this.exists(customerId)) {
      throw new BadRequestException('Customer already has at least one payment method attached.');
    }

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
