import { Module } from '@nestjs/common';
import { AdminService } from './services/admin.service';
import { StorageService } from './services/storage.service';

@Module({
  exports: [AdminService, StorageService],
  providers: [AdminService, StorageService],
})
export class CommonModule {}
