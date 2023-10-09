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
  }

  interface IUser extends UserRecord {
    profile: IProfile;
  }

  interface IProduct extends Stripe.Product {
    price: Stripe.Price;
  }
}
