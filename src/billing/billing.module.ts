import { Module } from '@nestjs/common';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { CheckoutSessionsModule } from './checkout-sessions/checkout-sessions.module';

@Module({
  imports: [PaymentMethodsModule, SubscriptionsModule, CheckoutSessionsModule],
})
export class BillingModule {}
