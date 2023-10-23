import { Injectable, NotFoundException } from '@nestjs/common';
import { CollectionReference, DocumentData, FieldValue } from 'firebase-admin/firestore';
import { AdminService } from '../common/services/admin.service';

@Injectable()
export class CommentsRepository {
  public readonly collection: CollectionReference<DocumentData>;
  private readonly serverTimestamp = FieldValue.serverTimestamp;

  constructor(private readonly admin: AdminService) {
    this.collection = this.admin.db.collection('comments');
  }

  async find(commentId: string): Promise<{ id: string; data: IComment } | null> {
    const doc = await this.collection.doc(commentId).get();
    if (!doc.exists) {
      return null;
    }
    const data = doc.data() as IComment;
    return { id: commentId, data };
  }

  async findOrFail(commentId: string) {
    const snapshot = await this.find(commentId);
    if (!snapshot) {
      throw new NotFoundException('Episode not found.');
    }
    return snapshot;
  }

  create(data: IComment) {
    return this.collection.add({ data, createdAt: this.serverTimestamp() });
  }

  update(commentId: string, data: { body?: string; likes?: string[] }, promise?: () => Promise<void>) {
    return this.admin.db.runTransaction(async (t) => {
      t.update(this.collection.doc(commentId), { ...data, updatedAt: this.serverTimestamp() });
      await promise?.();
    });
  }
}
