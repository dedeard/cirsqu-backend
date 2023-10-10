import { Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { AuthProfileGuard } from 'src/auth/guards/auth-profile.guard';

@UseGuards(AuthProfileGuard)
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('session/:priceId')
  create(@Req() { user }: { user: IUser }, @Param('priceId') priceId: string) {
    return this.checkoutService.create(user.profile.stripeCustomerId, priceId);
  }
}
