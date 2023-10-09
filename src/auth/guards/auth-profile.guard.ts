import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProfilesService } from '../../profiles/profiles.service';

@Injectable()
export class AuthProfileGuard extends AuthGuard('cookie-or-bearer') {
  constructor(private readonly profilesService: ProfilesService) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const canActivate = await super.canActivate(context);
    if (canActivate) {
      const request = context.switchToHttp().getRequest();
      request.user = await this.loadUserProfile(request.user);
    }
    return !!canActivate;
  }

  async loadUserProfile(user: IUser) {
    if (!user || !user.uid) throw new UnauthorizedException();
    try {
      user.profile = await this.profilesService.findOrFail(user.uid);
      return user;
    } catch (err: any) {
      throw new UnauthorizedException(err.message);
    }
  }

  handleRequest(err, user) {
    if (err || !user) throw err || new UnauthorizedException();
    return user;
  }
}
