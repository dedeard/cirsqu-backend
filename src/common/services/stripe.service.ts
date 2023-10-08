import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  readonly customers: Stripe.CustomersResource;
  readonly plans: Stripe.PlansResource;
  readonly prices: Stripe.PricesResource;

  constructor(private readonly config: ConfigService) {
    const stripe = new Stripe(config.getOrThrow('STRIPE_SECRET_KEY'), { apiVersion: '2023-08-16' });
    this.customers = stripe.customers;
    this.plans = stripe.plans;
    this.prices = stripe.prices;
  }
}
