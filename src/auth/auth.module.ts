import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { PassportModule } from '@nestjs/passport';
import { FirebaseStrategy } from './firebase.strategy';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [PassportModule, CommonModule, ProfilesModule],
  providers: [FirebaseStrategy],
})
export class AuthModule {}
