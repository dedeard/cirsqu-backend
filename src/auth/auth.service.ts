import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AdminService } from 'src/firebase-admin/admin.service';

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
}
