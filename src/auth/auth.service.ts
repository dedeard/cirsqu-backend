import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import admin from 'firebase-admin';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly auth = admin.auth();

  async login({ token, expiresIn }: { token?: string; expiresIn?: number }) {
    try {
      await this.auth.verifyIdToken(String(token), true);
      return await this.auth.createSessionCookie(String(token), { expiresIn: expiresIn * 1000 });
    } catch (err: any) {
      this.logger.error(err);
      throw new UnauthorizedException(err);
    }
  }
}
