import { Module } from '@nestjs/common';
import { AdminService } from './services/admin.service';
import { StorageService } from './services/storage.service';
import { StripeService } from './services/stripe.service';
import { AlgoliaService } from './services/algolia.service';
import { NotificationsService } from './services/notifications.service';

@Module({
  exports: [AdminService, StorageService, StripeService, AlgoliaService, NotificationsService],
  providers: [AdminService, StorageService, StripeService, AlgoliaService, NotificationsService],
})
export class CommonModule {}
