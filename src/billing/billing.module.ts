import { Module } from '@nestjs/common';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';

@Module({
  imports: [PaymentMethodsModule, SubscriptionsModule],
})
export class BillingModule {}
