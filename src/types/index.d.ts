import type { Timestamp } from 'firebase-admin/firestore';
import type { UserRecord } from 'firebase-admin/lib/auth/user-record';
import type { Stripe } from 'stripe';

declare global {
  interface ISubscription {
    customerId: string;
    recurring?: {
      subscriptionId: string;
      subscriptionStatus: string;
    };
    lifetime?: {
      paymentIntentId: string;
      paymentIntentStatus: string;
    };
  }

  interface IProfile {
    name: string;
    username: string;
    avatar?: string | null;
    bio?: string | null;
    website?: string | null;
    premium?: boolean;
    subscription: ISubscription;
  }

  interface IUser extends UserRecord {
    profile: IProfile;
    premium: boolean;
  }

  interface IProduct extends Stripe.Product {
    price: Stripe.Price;
  }

  interface IEpisode {
    lessonId: string;
    title: string;
    slug: string;
    index: number;
    seconds: number;
    description: string;
    videoId: string;
    premium?: boolean;
    downloadUrl?: string;
  }

  interface IComment {
    userId: string;
    targetId: string;
    targetType: 'answer' | 'episode' | 'reply';
    body: string;
    likes: string[];
    replyCount?: number;
  }

  interface ICollection {
    userId: string;
    lessonId: string;
  }

  interface INotification {
    userId: string;
    type: 'reply' | 'like' | 'subscription.recurring' | 'subscription.lifetime';
    data?: Record<string, any>;
  }

  interface IQuestion {
    userId: string;
    validAnswerId: string | null;
    title: string;
    tags: string[];
    content: string;
    likes: string[];
    createdAt: Timestamp;
    updatedAt: Timestamp | null;
  }
}
