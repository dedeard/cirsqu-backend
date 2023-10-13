import { Module } from '@nestjs/common';
import { PaymentIntentsService } from './payment-intents.service';
import { PaymentIntentsController } from './payment-intents.controller';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [PaymentIntentsController],
  providers: [PaymentIntentsService],
})
export class PaymentIntentsModule {}
