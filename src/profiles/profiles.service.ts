import { BadRequestException, Injectable } from '@nestjs/common';
import admin from 'firebase-admin';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';
import { StorageService } from '../firebase-admin/storage.service';
import urlToBuffer from 'src/utils/url-to-buffer';

export interface IProfile {
  name: string;
  username: string;
  avatar?: string | null;
  bio?: string | null;
  website?: string | null;
}

@Injectable()
export class ProfilesService {
  private readonly db = admin.firestore();
  private collection: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;

  constructor(private readonly storage: StorageService) {
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

    let avatar: string | undefined = undefined;
    if (user.photoURL) avatar = await this.generateAvatar(user.photoURL);

    await this.collection.doc(user.uid).set({ ...data, avatar });
  }

  async update(user: UserRecord, data: UpdateProfileDto, buffer?: Buffer): Promise<void> {
    const usernameExists = await this.usernameExists(data.username, user.uid);
    if (usernameExists) {
      throw new BadRequestException('Username already exists.');
    }

    const profileNotFound = !(await this.findOne(user.uid));
    if (profileNotFound) {
      throw new BadRequestException('User profile not found.');
    }

    let avatar: string | undefined = undefined;
    if (buffer) avatar = await this.generateAvatar(buffer);

    await this.collection.doc(user.uid).update({ ...data, avatar });
  }

  async generateAvatar(bufferOrUrl: Buffer | string) {
    let buffer: Buffer;

    if (typeof bufferOrUrl === 'string') {
      buffer = await urlToBuffer(new URL(bufferOrUrl));
    } else {
      buffer = bufferOrUrl;
    }

    const name = 'avatar/' + uuid() + '.jpg';
    const buff = await sharp(buffer).resize(200, 200, { fit: 'cover' }).toFormat('jpeg').toBuffer();
    await this.storage.save(name, buff);
    return name;
  }
}
