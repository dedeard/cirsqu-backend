import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';
import { CommonModule } from './common/common.module';
import { BillingModule } from './billing/billing.module';
import { ProductsModule } from './products/products.module';
import { StripeWebhookModule } from './stripe-webhook/stripe-webhook.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    AuthModule,
    ProfilesModule,
    BillingModule,
    ProductsModule,
    StripeWebhookModule,
  ],
  providers: [AppService],
})
export class AppModule {}
