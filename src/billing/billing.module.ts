import { Module } from '@nestjs/common';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { CheckoutSessionsModule } from './checkout-sessions/checkout-sessions.module';
import { WebhookModule } from './webhook/webhook.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [SubscriptionsModule, CheckoutSessionsModule, ProductsModule, WebhookModule],
})
export class BillingModule {}
