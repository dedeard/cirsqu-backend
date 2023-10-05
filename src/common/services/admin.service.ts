import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { App, cert, getApps } from 'firebase-admin/app';

@Injectable()
export class AdminService {
  readonly app: App;
  readonly auth: admin.auth.Auth;
  readonly db: admin.firestore.Firestore;
  readonly storage: admin.storage.Storage;

  constructor(private readonly config: ConfigService) {
    this.app = this.initAdminApp();
    this.auth = admin.auth();
    this.db = admin.firestore();
    this.storage = admin.storage();
  }

  getConfig() {
    const config: admin.AppOptions = {
      credential: cert({
        projectId: this.config.getOrThrow<string>('FBA_PROJECT_ID'),
        clientEmail: this.config.getOrThrow<string>('FBA_CLIENT_EMAIL'),
        privateKey: this.config.getOrThrow<string>('FBA_PRIVATE_KEY'),
      }),
      storageBucket: this.config.getOrThrow<string>('FBA_STORAGE_BUCKET'),
    };
    return config;
  }

  initAdminApp() {
    const apps = getApps();
    if (apps.length <= 0) {
      return admin.initializeApp(this.getConfig());
    }
    return apps[0];
  }
}
