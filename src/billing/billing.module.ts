import { Module } from '@nestjs/common';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { CheckoutModule } from './checkout/checkout.module';

@Module({
  imports: [PaymentMethodsModule, SubscriptionsModule, CheckoutModule],
})
export class BillingModule {}
