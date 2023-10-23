import { Injectable, NotFoundException } from '@nestjs/common';
import { CollectionReference, DocumentData } from 'firebase-admin/firestore';
import { AdminService } from '../common/services/admin.service';

@Injectable()
export class CommentsRepository {
  public readonly collection: CollectionReference<DocumentData>;

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
    return this.collection.add(data);
  }

  update(commentId: string, data: { body?: string; likes?: string[] }, promise?: () => Promise<void>) {
    return this.admin.db.runTransaction(async (t) => {
      t.update(this.collection.doc(commentId), data);
      await promise?.();
    });
  }
}
