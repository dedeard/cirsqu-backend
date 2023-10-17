import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';
import { CommonModule } from './common/common.module';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), CommonModule, AuthModule, ProfilesModule, BillingModule],
})
export class AppModule {}
