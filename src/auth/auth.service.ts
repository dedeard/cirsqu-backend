import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { AdminService } from '../common/services/admin.service';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private readonly admin: AdminService) {}

  async login({ token, expiresIn }: { token?: string; expiresIn?: number }) {
    try {
      await this.admin.auth.verifyIdToken(String(token), true);
      return await this.admin.auth.createSessionCookie(String(token), { expiresIn: expiresIn * 1000 });
    } catch (err: any) {
      this.logger.error(err);
      throw new UnauthorizedException(err);
    }
  }

  async generateCustomToken(user: UserRecord & { premium: boolean }) {
    try {
      return await this.admin.auth.createCustomToken(user.uid, { premium: user.premium });
    } catch (err: any) {
      this.logger.error(err);
      throw new InternalServerErrorException('Failed to generate custom token.');
    }
  }
}
