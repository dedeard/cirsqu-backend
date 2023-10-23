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
    identifier?: string;
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
}
