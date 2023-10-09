import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { AdminService } from '../common/services/admin.service';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';

@Injectable()
export class CookieOrBearerStrategy extends PassportStrategy(Strategy, 'cookie-or-bearer') {
  private readonly logger = new Logger(CookieOrBearerStrategy.name);
  constructor(private readonly admin: AdminService) {
    super();
  }

  async verifySessionCookie(session?: string | null): Promise<UserRecord> {
    if (!session) {
      throw new UnauthorizedException();
    }
    try {
      const decoded = await this.admin.auth.verifySessionCookie(session, true);
      return await this.admin.auth.getUser(decoded.uid);
    } catch (err: any) {
      this.logger.error(err);
      throw new UnauthorizedException(err);
    }
  }

  validate(req: Request) {
    let token: string = req.cookies?.['session'];

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    return this.verifySessionCookie(token);
  }
}
