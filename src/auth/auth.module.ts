import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CommonModule } from '../common/common.module';
import { PassportModule } from '@nestjs/passport';
import { CookieOrBearerStrategy } from './cookie-or-bearer.strategy';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [PassportModule, CommonModule, ProfilesModule],
  controllers: [AuthController],
  providers: [AuthService, CookieOrBearerStrategy],
  exports: [AuthService],
})
export class AuthModule {}
