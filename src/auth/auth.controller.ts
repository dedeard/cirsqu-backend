import { Controller, Res, Post, Body } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('login')
  async login(@Res({ passthrough: true }) res: Response, @Body('token') token?: string) {
    const sessionAge = Number(this.config.get<string>('SESSION_COOKIE_AGE', '5'));
    const secure = this.config.get<string>('SESSION_COOKIE_SECURE') === 'true';
    const expiresIn = 60 * 60 * 24 * sessionAge * 1000;
    const session = await this.authService.login({ token, expiresIn });

    res.cookie('session', session, {
      maxAge: expiresIn,
      domain: this.config.get('SESSION_COOKIE_DOMAIN'),
      httpOnly: secure,
      sameSite: secure ? 'none' : 'lax',
    });

    return res.status(200).json({ OK: true });
  }
}
