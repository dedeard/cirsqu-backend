import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { AdminService } from '../common/services/admin.service';
import { ProfilesRepository } from '../profiles/profiles.repository';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, 'firebase') {
  private readonly logger = new Logger(FirebaseStrategy.name);
  constructor(
    private readonly admin: AdminService,
    private readonly profilesRepository: ProfilesRepository,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    request.user = await this.validate(request);

    return true;
  }

  async validate(req: Request) {
    const token = this.extractTokenFromHeader(req.headers.authorization);
    if (!token) throw new UnauthorizedException();

    try {
      const decodedUser = await this.admin.auth.verifyIdToken(token, true);
      const userWithPremiumStatus = await this.attachUserProfileAndPremiumStatus(decodedUser);

      return userWithPremiumStatus;
    } catch (err) {
      this.logger.error(`Failed to authenticate user - ${err.message}`);
      throw new UnauthorizedException(`Authentication failed due to following reason - ${err.message}`);
    }
  }

  extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const tokenParts = authHeader.split(' ');

    if (tokenParts.length !== 2) {
      throw new Error('Invalid authorization header format.');
    }

    return tokenParts[1];
  }

  async attachUserProfileAndPremiumStatus(decodedUser: DecodedIdToken) {
    const userRecord = (await this.admin.auth.getUser(decodedUser.uid)) as IUser;

    const profileSnapshot = await this.profilesRepository.find(userRecord.uid);

    userRecord.premium = !!profileSnapshot?.data.premium;
    userRecord.profile = profileSnapshot?.data;

    return userRecord;
  }
}
