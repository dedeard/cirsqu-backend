import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { AuthGuard } from '@nestjs/passport';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { ProfilesService } from '../../profiles/profiles.service';

@UseGuards(AuthGuard('cookie-or-bearer'))
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(
    private readonly paymentMethodsService: PaymentMethodsService,
    private readonly profilesService: ProfilesService,
  ) {}

  @Get()
  async findAll(@Req() { user }: Request & { user: UserRecord }) {
    const profile = await this.profilesService.findOne(user.uid);
    return this.paymentMethodsService.findAll(profile.stripeCustomerId);
  }
}
