import { Injectable } from '@nestjs/common';
import { CollectionReference, DocumentData, FieldValue } from 'firebase-admin/firestore';
import { AdminService } from './admin.service';

@Injectable()
export class NotificationsService {
  public readonly collection: CollectionReference<DocumentData>;

  constructor(private readonly admin: AdminService) {
    this.collection = this.admin.db.collection('notifications');
  }

  async create(notification: INotification) {
    return this.collection.add({ ...notification, createdAt: FieldValue.serverTimestamp() });
  }

  async onReply(userId: string, data: { userId: string; commentId: string; replyId: string }) {
    return this.create({ userId, type: 'reply', data });
  }

  async onLike(userId: string, data: { userId: string; commentId: string }) {
    const snapshot = await this.collection.where('userId', '==', userId).get();

    let exists = false;
    for (const doc of snapshot.docs) {
      const notif = doc.data() as INotification;
      if (notif.type === 'like' && notif.data.userId === data.userId && notif.data.commentId === data.commentId) {
        exists = true;
      }
    }

    if (!exists) {
      return this.create({ userId, type: 'like', data });
    }
  }
}
