import { Bucket } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { AdminService } from './admin.service';

@Injectable()
export class StorageService {
  constructor(private readonly admin: AdminService) {}

  get bucket() {
    return this.admin.storage.bucket() as unknown as Bucket;
  }

  async save(name: string, buffer: Buffer) {
    const { fileTypeFromBuffer } = await import('file-type');
    const type = await fileTypeFromBuffer(buffer);
    await this.bucket.file(name).save(buffer, {
      metadata: { contentType: type.mime },
    });
    await this.bucket.file(name).makePublic();
  }

  async remove(name: string) {
    await this.bucket.file(name).delete();
  }

  async removeIfExists(name: string) {
    if (await this.exists(name)) return this.remove(name);
  }

  exists(name: string) {
    return this.bucket.file(name).exists();
  }
}
