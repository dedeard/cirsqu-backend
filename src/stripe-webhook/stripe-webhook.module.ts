import { Module } from '@nestjs/common';
import { StripeWebhookService } from './stripe-webhook.service';
import { StripeWebhookController } from './stripe-webhook.controller';
import { CommonModule } from '../common/common.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [CommonModule, ProfilesModule],
  controllers: [StripeWebhookController],
  providers: [StripeWebhookService],
})
export class StripeWebhookModule {}
