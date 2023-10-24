import { Module } from '@nestjs/common';
import { AdminService } from './services/admin.service';
import { StorageService } from './services/storage.service';
import { StripeService } from './services/stripe.service';
import { AlgoliaService } from './services/algolia.service';

@Module({
  exports: [AdminService, StorageService, StripeService, AlgoliaService],
  providers: [AdminService, StorageService, StripeService, AlgoliaService],
})
export class CommonModule {}
