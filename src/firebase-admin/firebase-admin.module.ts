import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { StorageService } from './storage.service';

@Module({
  exports: [AdminService, StorageService],
  providers: [AdminService, StorageService],
})
export class FirebaseAdminModule {}
