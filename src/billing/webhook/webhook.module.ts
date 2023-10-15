import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { CommonModule } from '../../common/common.module';
import { ProfilesModule } from '../../profiles/profiles.module';

@Module({
  imports: [CommonModule, ProfilesModule],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
