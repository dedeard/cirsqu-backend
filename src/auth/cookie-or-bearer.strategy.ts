import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { AdminService } from '../common/services/admin.service';
import { ProfilesService } from '../profiles/profiles.service';

@Injectable()
export class CookieOrBearerStrategy extends PassportStrategy(Strategy, 'cookie-or-bearer') {
  private readonly logger = new Logger(CookieOrBearerStrategy.name);
  constructor(
    private readonly admin: AdminService,
    private readonly profilesService: ProfilesService,
  ) {
    super();
  }
  async verifySessionCookie(session?: string | null): Promise<IUser> {
    if (!session) {
      throw new UnauthorizedException();
    }
    try {
      const decoded = await this.admin.auth.verifySessionCookie(session, true);
      const user = (await this.admin.auth.getUser(decoded.uid)) as IUser;
      user.profile = await this.profilesService.find(decoded.uid);
      return user;
    } catch (err: any) {
      this.logger.error(err);
      throw new UnauthorizedException(err);
    }
  }

  async validate(req: Request) {
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
