import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  readonly customers: Stripe.CustomersResource;
  readonly products: Stripe.ProductsResource;
  readonly prices: Stripe.PricesResource;
  readonly paymentIntents: Stripe.PaymentIntentsResource;
  readonly subscriptions: Stripe.SubscriptionsResource;
  readonly paymentMethods: Stripe.PaymentMethodsResource;
  readonly checkoutSessions: Stripe.Checkout.SessionsResource;
  readonly invoices: Stripe.InvoicesResource;
  readonly webhooks: Stripe.Webhooks;
  readonly charges: Stripe.ChargesResource;
  readonly portalSessions: Stripe.BillingPortal.SessionsResource;
  readonly portalConfigurations: Stripe.BillingPortal.ConfigurationsResource;

  constructor(private readonly config: ConfigService) {
    const stripe = new Stripe(config.getOrThrow('STRIPE_SECRET_KEY'), { apiVersion: '2023-08-16' });
    this.customers = stripe.customers;
    this.products = stripe.products;
    this.prices = stripe.prices;
    this.paymentIntents = stripe.paymentIntents;
    this.subscriptions = stripe.subscriptions;
    this.paymentMethods = stripe.paymentMethods;
    this.checkoutSessions = stripe.checkout.sessions;
    this.invoices = stripe.invoices;
    this.webhooks = stripe.webhooks;
    this.charges = stripe.charges;
    this.portalSessions = stripe.billingPortal.sessions;
    this.portalConfigurations = stripe.billingPortal.configurations;
  }
}
