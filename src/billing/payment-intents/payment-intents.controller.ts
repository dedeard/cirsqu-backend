import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { PaymentIntentsService } from './payment-intents.service';
import Stripe from 'stripe';
import { AuthProfileGuard } from 'src/auth/guards/auth-profile.guard';

@UseGuards(AuthProfileGuard)
@Controller('payment-intents')
export class PaymentIntentsController {
  constructor(private readonly paymentIntentsService: PaymentIntentsService) {}

  @Get()
  list(@Req() { user }: { user: IUser }, @Query() paginations: Stripe.PaginationParams) {
    return this.paymentIntentsService.list(user.profile.stripeCustomerId, paginations);
  }

  @Get(':id')
  find(@Req() { user }: { user: IUser }, @Param('id') id: string) {
    return this.paymentIntentsService.find(user.profile.stripeCustomerId, id);
  }
}
