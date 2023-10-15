import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { CommonModule } from '../../common/common.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [CommonModule, ProductsModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
})
export class SubscriptionsModule {}
