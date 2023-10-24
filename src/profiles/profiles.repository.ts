import { Injectable, NotFoundException } from '@nestjs/common';
import { FieldValue, CollectionReference, DocumentData } from 'firebase-admin/firestore';
import { AdminService } from '../common/services/admin.service';
import { AlgoliaService } from '../common/services/algolia.service';
import { SearchIndex } from 'algoliasearch';

@Injectable()
export class ProfilesRepository {
  public readonly collection: CollectionReference<DocumentData>;
  public readonly index: SearchIndex;
  private readonly serverTimestamp = FieldValue.serverTimestamp;

  constructor(
    private readonly admin: AdminService,
    private readonly algolia: AlgoliaService,
  ) {
    this.collection = this.admin.db.collection('profiles');
    this.index = this.algolia.profilesIndex;
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
    return this.admin.db.runTransaction(async (t) => {
      const ref = this.collection.doc(uid);
      t.set(ref, { ...profile, createdAt: this.serverTimestamp() });
      await this.index.saveObject({
        objectID: uid,
        name: profile.name,
        username: profile.username,
        premium: !!profile.premium,
        avatar: profile.avatar,
      });
    });
  }

  update(uid: string, profile: Partial<IProfile>, promise?: () => Promise<any>) {
    return this.admin.db.runTransaction(async (t) => {
      t.update(this.collection.doc(uid), profile);

      const currentProfile = await this.findOrFail(uid);

      let premium = !!currentProfile.data.premium;
      if (typeof profile.premium !== 'undefined') {
        premium = profile.premium;
      }

      await this.index.partialUpdateObject(
        {
          objectID: uid,
          name: profile.name || currentProfile.data.name,
          username: profile.username || currentProfile.data.username,
          avatar: profile.avatar || currentProfile.data.avatar,
          premium,
        },
        { createIfNotExists: true },
      );

      await promise?.();
    });
  }
}
