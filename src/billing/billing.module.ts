import { Module } from '@nestjs/common';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { CheckoutSessionsModule } from './checkout-sessions/checkout-sessions.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentIntentsModule } from './payment-intents/payment-intents.module';
import { ChargesModule } from './charges/charges.module';

@Module({
  imports: [PaymentMethodsModule, SubscriptionsModule, CheckoutSessionsModule, InvoicesModule, PaymentIntentsModule, ChargesModule],
})
export class BillingModule {}
