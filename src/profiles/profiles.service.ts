import { BadRequestException, Injectable } from '@nestjs/common';
import admin from 'firebase-admin';
import { IProfile } from '../types';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';

@Injectable()
export class ProfilesService {
  private readonly db = admin.firestore();
  private collection: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;

  constructor() {
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

  async findOne(uid: string): Promise<IProfile | null> {
    const doc = await this.collection.doc(uid).get();
    if (doc.exists) {
      return doc.data() as IProfile;
    }
    return null;
  }

  async create(user: UserRecord, data: CreateProfileDto): Promise<void> {
    const usernameExists = await this.usernameExists(data.username);
    if (usernameExists) {
      throw new BadRequestException('Username already exists.');
    }

    const profileExists = await this.findOne(user.uid);
    if (profileExists) {
      throw new BadRequestException('Profile already created.');
    }

    await this.collection.doc(user.uid).set(data);
  }

  async update(user: UserRecord, data: UpdateProfileDto): Promise<void> {
    const usernameExists = await this.usernameExists(data.username, user.uid);
    if (usernameExists) {
      throw new BadRequestException('Username already exists.');
    }

    const profileNotFound = !(await this.findOne(user.uid));
    if (profileNotFound) {
      throw new BadRequestException('User profile not found.');
    }

    await this.collection.doc(user.uid).update({ ...data });
  }
}
