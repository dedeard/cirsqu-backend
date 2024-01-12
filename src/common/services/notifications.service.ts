import type { Stripe } from 'stripe';
import { Injectable, Logger } from '@nestjs/common';
import { CollectionReference, DocumentData, FieldValue } from 'firebase-admin/firestore';
import { AdminService } from './admin.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  public readonly collection: CollectionReference<DocumentData>;
  public readonly lessons: CollectionReference<DocumentData>;
  public readonly episodes: CollectionReference<DocumentData>;
  public readonly comments: CollectionReference<DocumentData>;

  constructor(private readonly admin: AdminService) {
    this.collection = this.admin.db.collection('notifications');
    this.lessons = this.admin.db.collection('lessons');
    this.episodes = this.admin.db.collection('episodes');
    this.comments = this.admin.db.collection('comments');
  }

  create(notification: INotification) {
    return this.collection.add({ ...notification, createdAt: FieldValue.serverTimestamp() });
  }

  async getPathByEpiosdeId(episodeId: string): Promise<string> {
    const episodeSnap = await this.episodes.doc(episodeId).get();
    const episode = episodeSnap.data() as IEpisode;
    const lessonSnap = await this.lessons.doc(episode.lessonId).get();
    const lesson = lessonSnap.data();
    return `lessons/${lesson.slug}/${episodeSnap.id}`;
  }

  async getPathByCommentId(commentId: string): Promise<string> {
    const commentSnap = await this.comments.doc(commentId).get();
    const comment = commentSnap.data() as IComment;
    switch (comment.targetType) {
      case 'episode':
        return this.getPathByEpiosdeId(comment.targetId);
      case 'reply':
        return this.getPathByCommentId(comment.targetId);
      default:
        return '';
    }
  }

  async onReply(userId: string, data: { userId: string; commentId: string; replyId: string }) {
    if (userId !== data.userId) {
      try {
        const path = await this.getPathByCommentId(data.commentId);
        await this.create({ userId, type: 'reply', data: { ...data, path } });
      } catch (error: any) {
        this.logger.error(`Reply failed - ${error.message}`);
      }
    }
  }

  async onAnswer(userId: string, data: { userId: string; commentId: string; questionId: string }) {
    if (userId !== data.userId) {
      try {
        await this.create({ userId, type: 'answer', data: { ...data, path: `forum/${data.questionId}` } });
      } catch (error: any) {
        this.logger.error(`Answer failed - ${error.message}`);
      }
    }
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
      const path = await this.getPathByCommentId(data.commentId);
      return this.create({ userId, type: 'like', data: { ...data, path } });
    }
  }

  async onSubscriptionRecurring(userId: string, subscription: Stripe.Subscription) {
    return this.create({
      userId,
      type: 'subscription.recurring',
      data: {
        status: subscription.status,
        plan: subscription.items.data[0]?.price?.lookup_key || null,
      },
    });
  }

  async onSubscriptionLifetime(userId: string, paymentIntent: Stripe.PaymentIntent) {
    return this.create({
      userId,
      type: 'subscription.lifetime',
      data: {
        status: paymentIntent.status,
        plan: 'lifetime',
      },
    });
  }
}
