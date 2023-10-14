import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import admin from 'firebase-admin';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';
import { StorageService } from '../common/services/storage.service';
import urlToBuffer from '../common/utils/url-to-buffer';
import { StripeService } from '../common/services/stripe.service';

@Injectable()
export class ProfilesService {
  private readonly db = admin.firestore();
  private readonly serverTimestamp = admin.firestore.FieldValue.serverTimestamp;
  private readonly collection: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;

  constructor(
    private readonly storage: StorageService,
    private readonly stripe: StripeService,
  ) {
    this.collection = this.db.collection('profiles');
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

  async findOrFail(uid: string): Promise<IProfile | null> {
    const profile = await this.find(uid);
    if (!profile) {
      throw new NotFoundException('Profile not found.');
    }
    return profile;
  }

  async find(uid: string): Promise<IProfile | null> {
    const doc = await this.collection.doc(uid).get();
    if (doc.exists) {
      return doc.data() as IProfile;
    }
    return null;
  }

  async create(user: UserRecord, data: CreateProfileDto) {
    const usernameExists = await this.usernameExists(data.username);
    if (usernameExists) {
      throw new BadRequestException('Username already exists.');
    }

    const profileExists = await this.find(user.uid);
    if (profileExists) {
      throw new BadRequestException('Profile already created.');
    }

    let avatar: string | undefined = undefined;
    if (user.photoURL) avatar = await this.generateAvatar(user.photoURL);

    const customer = await this.stripe.customers.create({
      name: data.name,
      email: user.email,
      metadata: { userId: user.uid, username: data.username },
    });

    const profile: IProfile = {
      name: data.name,
      username: data.username,
      avatar: avatar,
      subscription: {
        customerId: customer.id,
      },
    };

    await this.collection.doc(user.uid).set({ ...profile, createdAt: this.serverTimestamp() });

    return this.find(user.uid);
  }

  async update(user: IUser, data: UpdateProfileDto, buffer?: Buffer) {
    const usernameExists = await this.usernameExists(data.username, user.uid);
    if (usernameExists) {
      throw new BadRequestException('Username already exists.');
    }

    const dataToUpdata: UpdateProfileDto & { avatar?: string } = { ...data };
    if (buffer) dataToUpdata.avatar = await this.generateAvatar(buffer, user.profile.avatar);

    await this.db.runTransaction(async (t) => {
      t.update(this.collection.doc(user.uid), { ...dataToUpdata });
      if (user.profile.username !== dataToUpdata.username || user.profile.name !== dataToUpdata.name) {
        await this.stripe.customers.update(user.profile.subscription.customerId, {
          name: dataToUpdata.name,
          metadata: { username: dataToUpdata.username },
        });
      }
    });

    return this.findOrFail(user.uid);
  }

  async generateAvatar(bufferOrUrl: Buffer | string, old?: string) {
    let buffer: Buffer;

    if (typeof bufferOrUrl === 'string') {
      buffer = await urlToBuffer(new URL(bufferOrUrl));
    } else {
      buffer = bufferOrUrl;
    }

    const name = 'avatar/' + uuid() + '.jpg';
    const buff = await sharp(buffer).resize(200, 200, { fit: 'cover' }).toFormat('jpeg').toBuffer();
    await this.storage.save(name, buff);
    if (old) {
      await this.storage.removeIfExists(old);
    }

    return name;
  }

  async findByStripeCustomerId(customerId: string) {
    const snapshot = await this.collection.where('subscription.customerId', '==', customerId).get();
    if (snapshot.empty) {
      throw new NotFoundException('Profile not found.');
    }
    const profiles: { id: string; data: IProfile }[] = [];
    for (const doc of snapshot.docs) {
      profiles.push({ id: doc.id, data: doc.data() as IProfile });
    }
    return profiles[0];
  }

  async updateSubscription(userId: string, subscription: ISubscription) {
    await this.collection.doc(userId).update({ subscription });
  }
}
