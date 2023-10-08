import { Module } from '@nestjs/common';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';

@Module({
  imports: [PaymentMethodsModule],
})
export class BillingModule {}
