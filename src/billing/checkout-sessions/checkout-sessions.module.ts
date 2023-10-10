import { Module } from '@nestjs/common';
import { CheckoutSessionsService } from './checkout-sessions.service';
import { CheckoutSessionsController } from './checkout-sessions.controller';

@Module({
  controllers: [CheckoutSessionsController],
  providers: [CheckoutSessionsService],
})
export class CheckoutSessionsModule {}
