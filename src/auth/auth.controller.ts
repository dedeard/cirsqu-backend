import { Controller, Res, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('login')
  async login(@Res() res: Response, @Body('token') token?: string) {
    const sessionAge = Number(this.config.get<string>('SESSION_COOKIE_AGE', '5'));
    const secure = this.config.get<string>('SESSION_COOKIE_SECURE') === 'true';
    const expiresIn = 60 * 60 * 24 * sessionAge;
    const session = await this.authService.login({ token, expiresIn });

    res.cookie('session', session, {
      maxAge: expiresIn,
      domain: this.config.get('SESSION_COOKIE_DOMAIN'),
      httpOnly: secure,
      secure,
      sameSite: secure ? 'none' : 'lax',
    });

    res.end();
  }

  @UseGuards(AuthGuard('cookie-or-bearer'))
  @Get('custom-token')
  async generateCustomToken(@Req() { user }: { user: UserRecord }) {
    const token = await this.authService.generateCustomToken(user);
    return { token };
  }

  @UseGuards(AuthGuard('cookie-or-bearer'))
  @Get('user-data')
  async getUserData(@Req() { user }: { user: UserRecord }) {
    return user.toJSON();
  }
}
