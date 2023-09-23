import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { auth as authentication, firestore, initializeApp } from 'firebase-admin';
import { App, AppOptions, cert, getApps } from 'firebase-admin/app';

@Injectable()
export class AdminService {
  protected readonly app: App;
  protected readonly auth: authentication.Auth;
  protected readonly db: firestore.Firestore;

  constructor(private readonly config: ConfigService) {
    const appConfig = this.getConfig();
    this.app = this.initAdminApp(appConfig);
    this.auth = authentication();
    this.db = firestore();
  }

  getConfig() {
    return {
      credential: cert({
        projectId: this.config.get<string>('FBA_PROJECT_ID', ''),
        clientEmail: this.config.get<string>('FBA_CLIENT_EMAIL', ''),
        privateKey: this.config.get<string>('FBA_PRIVATE_KEY', ''),
      }),
    };
  }

  initAdminApp(config: AppOptions) {
    const apps = getApps();
    if (apps.length <= 0) {
      return initializeApp(config);
    }
    return apps[0];
  }
}
