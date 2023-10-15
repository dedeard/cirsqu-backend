import { BadRequestException, Injectable } from '@nestjs/common';
import { CollectionReference, DocumentData } from 'firebase-admin/firestore';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import sharp from 'sharp';
import { StorageService } from '../common/services/storage.service';
import urlToBuffer from '../common/utils/url-to-buffer';
import { StripeService } from '../common/services/stripe.service';
import { AdminService } from '../common/services/admin.service';
import { randomUUID } from 'crypto';
import { ProfilesRepository } from './profiles.repository';

@Injectable()
export class ProfilesService {
  public readonly collection: CollectionReference<DocumentData>;

  constructor(
    private readonly repository: ProfilesRepository,
    private readonly storage: StorageService,
    private readonly stripe: StripeService,
    private readonly admin: AdminService,
  ) {
    this.collection = this.repository.collection;
  }

  async create(user: UserRecord, data: CreateProfileDto) {
    const usernameExists = await this.repository.usernameExists(data.username);
    if (usernameExists) {
      throw new BadRequestException('Username already exists.');
    }

    const profileExists = await this.repository.find(user.uid);
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

    await this.repository.create(user.uid, profile);
  }

  async update(user: IUser, data: UpdateProfileDto, buffer?: Buffer) {
    const usernameExists = await this.repository.usernameExists(data.username, user.uid);
    if (usernameExists) {
      throw new BadRequestException('Username already exists.');
    }

    const dataToUpdata: UpdateProfileDto & { avatar?: string } = { ...data };
    if (buffer) dataToUpdata.avatar = await this.generateAvatar(buffer, user.profile.avatar);

    return this.repository.update(user.uid, dataToUpdata, async () => {
      if (user.profile.username !== dataToUpdata.username || user.profile.name !== dataToUpdata.name) {
        await this.stripe.customers.update(user.profile.subscription.customerId, {
          name: dataToUpdata.name,
          metadata: { username: dataToUpdata.username },
        });
      }
    });
  }

  async generateAvatar(bufferOrUrl: Buffer | string, old?: string) {
    let buffer: Buffer;

    if (typeof bufferOrUrl === 'string') {
      buffer = await urlToBuffer(new URL(bufferOrUrl));
    } else {
      buffer = bufferOrUrl;
    }

    const name = 'avatar/' + randomUUID() + '.jpg';
    const buff = await sharp(buffer).resize(200, 200, { fit: 'cover' }).toFormat('jpeg').toBuffer();
    await this.storage.save(name, buff);
    if (old) {
      await this.storage.removeIfExists(old);
    }

    return name;
  }
}
