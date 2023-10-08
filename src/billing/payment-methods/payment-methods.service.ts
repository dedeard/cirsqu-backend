import { Injectable } from '@nestjs/common';
import { StripeService } from '../../common/services/stripe.service';

@Injectable()
export class PaymentMethodsService {
  constructor(private readonly stripe: StripeService) {}
  findAll(customerId: string) {
    return this.stripe.customers.listPaymentMethods(customerId, { type: 'card' });
  }
}
