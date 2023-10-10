import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { AuthProfileGuard } from '../../auth/guards/auth-profile.guard';
import Stripe from 'stripe';

@UseGuards(AuthProfileGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  list(@Req() { user }: { user: IUser }, @Query() paginations: Stripe.PaginationParams) {
    return this.subscriptionsService.list(user.profile.stripeCustomerId, paginations);
  }

  @Get(':id')
  find(@Req() { user }: { user: IUser }, @Param('id') id: string) {
    return this.subscriptionsService.find(user.profile.stripeCustomerId, id);
  }
}
