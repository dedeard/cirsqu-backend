import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { FirebaseAdminModule } from '../firebase-admin/firebase-admin.module';

@Module({
  imports: [FirebaseAdminModule],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
