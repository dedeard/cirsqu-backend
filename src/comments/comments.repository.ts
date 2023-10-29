import { Injectable, NotFoundException } from '@nestjs/common';
import { CollectionReference, DocumentData, FieldValue } from 'firebase-admin/firestore';
import { AdminService } from '../common/services/admin.service';

@Injectable()
export class CommentsRepository {
  public readonly collection: CollectionReference<DocumentData>;
  private readonly serverTimestamp = FieldValue.serverTimestamp;
  private readonly increment = FieldValue.increment;

  constructor(private readonly admin: AdminService) {
    this.collection = this.admin.db.collection('comments');
  }

  async find(commentId: string): Promise<{ id: string; data: IComment; ref: FirebaseFirestore.DocumentReference<DocumentData> } | null> {
    const doc = await this.collection.doc(commentId).get();
    if (!doc.exists) {
      return null;
    }
    const data = doc.data() as IComment;
    return { id: commentId, data, ref: doc.ref };
  }

  async findOrFail(commentId: string) {
    const snapshot = await this.find(commentId);
    if (!snapshot) {
      throw new NotFoundException('Episode not found.');
    }
    return snapshot;
  }

  async create(data: IComment) {
    const docRef = this.collection.doc();
    await this.admin.db.runTransaction(async (t) => {
      t.set(docRef, { ...data, createdAt: this.serverTimestamp() });

      if (data.targetType === 'reply') {
        const target = await this.findOrFail(data.targetId);

        if (target.data.replyCount) {
          t.update(target.ref, { replyCount: this.increment(1) });
        } else {
          t.update(target.ref, { replyCount: 1 });
        }
      }
    });
    return docRef.id;
  }

  update(commentId: string, data: { body?: string; likes?: string[] }, skipTimestamp?: boolean) {
    return this.admin.db.runTransaction(async (t) => {
      if (skipTimestamp) {
        t.update(this.collection.doc(commentId), data);
      } else {
        t.update(this.collection.doc(commentId), { ...data, updatedAt: this.serverTimestamp() });
      }
    });
  }

  destroy(commentId: string) {
    return this.admin.db.runTransaction(async (t) => {
      const target = await this.findOrFail(commentId);
      t.delete(target.ref);

      if (target.data.targetType === 'reply') {
        const parent = await this.findOrFail(target.data.targetId);
        if (parent.data.replyCount) {
          t.update(parent.ref, { replyCount: this.increment(-1) });
        }
      } else {
        const repliesSnapshot = await this.collection.where('targetId', '==', commentId).get();
        repliesSnapshot.docs.forEach((doc) => {
          t.delete(doc.ref);
        });
      }
    });
  }
}
