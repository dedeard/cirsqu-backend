import { Module } from '@nestjs/common';
import { AdminService } from './services/admin.service';
import { StorageService } from './services/storage.service';
import { StripeService } from './services/stripe.service';

@Module({
  exports: [AdminService, StorageService, StripeService],
  providers: [AdminService, StorageService, StripeService],
})
export class CommonModule {}
