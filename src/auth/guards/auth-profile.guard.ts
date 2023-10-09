import { UnauthorizedException, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AuthProfileGuard extends AuthGuard('cookie-or-bearer') {
  async canActivate(context: ExecutionContext) {
    const canActivate = await super.canActivate(context);
    if (!canActivate) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    if (!request.user?.profile) {
      throw new UnauthorizedException('User profile not found');
    }

    return true;
  }
}
