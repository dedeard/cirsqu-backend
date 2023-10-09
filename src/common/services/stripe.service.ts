import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  readonly customers: Stripe.CustomersResource;
  readonly products: Stripe.ProductsResource;
  readonly plans: Stripe.PlansResource;
  readonly prices: Stripe.PricesResource;
  readonly paymentIntents: Stripe.PaymentIntentsResource;
  readonly subscriptions: Stripe.SubscriptionsResource;
  readonly paymentMethods: Stripe.PaymentMethodsResource;

  constructor(private readonly config: ConfigService) {
    const stripe = new Stripe(config.getOrThrow('STRIPE_SECRET_KEY'), { apiVersion: '2023-08-16' });
    this.customers = stripe.customers;
    this.products = stripe.products;
    this.plans = stripe.plans;
    this.prices = stripe.prices;
    this.paymentIntents = stripe.paymentIntents;
    this.subscriptions = stripe.subscriptions;
    this.paymentMethods = stripe.paymentMethods;
  }
}
