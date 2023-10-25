import { BadRequestException, Injectable } from '@nestjs/common';
import { CollectionReference, DocumentData, FieldValue } from 'firebase-admin/firestore';
import { AdminService } from '../common/services/admin.service';

@Injectable()
export class CollectionsService {
  public readonly collection: CollectionReference<DocumentData>;
  private readonly serverTimestamp = FieldValue.serverTimestamp;

  constructor(private readonly admin: AdminService) {
    this.collection = this.admin.db.collection('collections');
  }

  async lessonExists(lessonId: string) {
    const { exists } = await this.admin.db.collection('lessons').doc(lessonId).get();
    return exists;
  }

  async exists(userId: string, lessonId: string) {
    const snapshot = await this.collection.where('userId', '==', userId).where('lessonId', '==', lessonId).get();
    if (snapshot.empty) {
      return false;
    }
    return true;
  }

  async create(userId: string, lessonId?: string) {
    if (!lessonId) {
      throw new BadRequestException('Lesson ID is required.');
    }

    const lessonExists = await this.lessonExists(lessonId);
    const collectionExists = await this.exists(userId, lessonId);

    if (!lessonExists) {
      throw new BadRequestException('The specified lesson does not exist.');
    }
    if (collectionExists) {
      throw new BadRequestException('The collection already exists for the specified user and lesson.');
    }

    await this.collection.add({ userId, lessonId, createdAt: this.serverTimestamp() });
  }
}
