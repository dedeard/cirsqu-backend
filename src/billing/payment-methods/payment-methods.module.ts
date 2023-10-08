import { Module } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethodsController } from './payment-methods.controller';
import { CommonModule } from '../../common/common.module';
import { ProfilesModule } from '../../profiles/profiles.module';

@Module({
  imports: [CommonModule, ProfilesModule],
  controllers: [PaymentMethodsController],
  providers: [PaymentMethodsService],
})
export class PaymentMethodsModule {}
