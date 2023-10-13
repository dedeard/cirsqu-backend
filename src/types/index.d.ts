import type { UserRecord } from 'firebase-admin/lib/auth/user-record';
import type { Stripe } from 'stripe';

declare global {
  interface IProfile {
    name: string;
    username: string;
    createdAt: string;
    stripeCustomerId: string;
    avatar?: string | null;
    bio?: string | null;
    website?: string | null;
    subscriptions?: {
      id: string;
      status: string;
      recurring: boolean;
      cancelAt: number | null;
      priceId?: string;
    }[];
  }

  interface IUser extends UserRecord {
    profile: IProfile;
  }

  interface IProduct extends Stripe.Product {
    price: Stripe.Price;
  }
}
