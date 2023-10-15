import { Injectable, NotFoundException } from '@nestjs/common';
import { FieldValue, CollectionReference, DocumentData } from 'firebase-admin/firestore';
import { AdminService } from '../common/services/admin.service';

@Injectable()
export class ProfilesRepository {
  public readonly collection: CollectionReference<DocumentData>;
  private readonly serverTimestamp = FieldValue.serverTimestamp;

  constructor(private readonly admin: AdminService) {
    this.collection = this.admin.db.collection('profiles');
  }

  async usernameExists(username: string, excludeId?: string): Promise<boolean> {
    const snapshot = await this.collection.where('username', '==', username).get();
    if (snapshot.empty) {
      return false;
    }
    for (const doc of snapshot.docs) {
      if (doc.id !== excludeId) {
        return true;
      }
    }
    return false;
  }

  async find(uid: string): Promise<{ id: string; data: IProfile } | null> {
    const doc = await this.collection.doc(uid).get();
    if (!doc.exists) {
      return null;
    }
    const data = doc.data() as IProfile;
    return { id: uid, data };
  }

  async findOrFail(uid: string) {
    const snapshot = await this.find(uid);
    if (!snapshot) {
      throw new NotFoundException('Profile not found.');
    }
    return snapshot;
  }

  async findByCustomerId(customerId: string): Promise<{ id: string; data: IProfile } | null> {
    const snapshot = await this.collection.where('subscription.customerId', '==', customerId).get();
    if (snapshot.empty) {
      return null;
    }
    const profiles: { id: string; data: IProfile }[] = [];
    for (const doc of snapshot.docs) {
      profiles.push({ id: doc.id, data: doc.data() as IProfile });
    }
    return profiles[0];
  }

  create(uid: string, profile: IProfile) {
    return this.collection.doc(uid).set({ ...profile, createdAt: this.serverTimestamp() });
  }

  update(uid: string, profile: Partial<IProfile>, promise?: () => Promise<any>) {
    return this.admin.db.runTransaction(async (t) => {
      t.update(this.collection.doc(uid), profile);
      await promise?.();
    });
  }
}
