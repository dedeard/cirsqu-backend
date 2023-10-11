import { Module } from '@nestjs/common';
import { CheckoutSessionsService } from './checkout-sessions.service';
import { CheckoutSessionsController } from './checkout-sessions.controller';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [CheckoutSessionsController],
  providers: [CheckoutSessionsService],
})
export class CheckoutSessionsModule {}
