import { Injectable } from '@nestjs/common';
import admin from 'firebase-admin';

@Injectable()
export class StorageService {
  private readonly bucket = admin.storage().bucket();

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
