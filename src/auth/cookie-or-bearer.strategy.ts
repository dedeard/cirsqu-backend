import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import admin from 'firebase-admin';

@Injectable()
export class CookieOrBearerStrategy extends PassportStrategy(Strategy, 'cookie-or-bearer') {
  private readonly logger = new Logger(CookieOrBearerStrategy.name);
  private readonly auth = admin.auth();

  async verifySessionCookie(session?: string | null) {
    if (!session) {
      throw new UnauthorizedException();
    }
    try {
      const decoded = await this.auth.verifySessionCookie(session, true);
      return await this.auth.getUser(decoded.uid);
    } catch (err: any) {
      this.logger.error(err);
      throw new UnauthorizedException(err);
    }
  }

  async validate(req: Request): Promise<admin.auth.UserRecord> {
    let token: string = req.cookies?.['session'];

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    return await this.verifySessionCookie(token);
  }
}
