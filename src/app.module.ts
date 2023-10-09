import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CookieOrBearerStrategy } from './auth/cookie-or-bearer.strategy';
import { PassportModule } from '@nestjs/passport';
import { ProfilesModule } from './profiles/profiles.module';
import { CommonModule } from './common/common.module';
import { BillingModule } from './billing/billing.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    PassportModule,
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    AuthModule,
    ProfilesModule,
    BillingModule,
    ProductsModule,
  ],
  providers: [CookieOrBearerStrategy, AppService],
})
export class AppModule {}
