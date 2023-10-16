import { Injectable } from '@nestjs/common';
import { StripeService } from '../../common/services/stripe.service';
import Stripe from 'stripe';

@Injectable()
export class InvoicesService {
  constructor(private readonly stripe: StripeService) {}

  list(customerId: string, paginations?: Stripe.PaginationParams) {
    return this.stripe.invoices.list({ customer: customerId, ...paginations, expand: ['data.subscription.plan.product'] });
  }
}
