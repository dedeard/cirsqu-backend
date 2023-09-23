import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AdminService } from '../admin.service';

@Module({
  controllers: [AuthController],
  providers: [AdminService, AuthService],
})
export class AuthModule {}
