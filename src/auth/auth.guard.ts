import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard as BaseAuthGuard } from '@nestjs/passport';
import { AllowedMetaData } from './auth-metadata.guard';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard extends BaseAuthGuard('firebase') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const metadata = this.reflector.getAllAndOverride<AllowedMetaData[]>('auth', [context.getHandler(), context.getClass()]);

    if (metadata?.includes('skip')) {
      return true;
    }

    await super.canActivate(context);

    if (!request.user?.profile && !metadata?.includes('skip-profile')) {
      throw new UnauthorizedException(`No profile found for the user with id - ${request.user.uid}`);
    }

    return true;
  }
}
