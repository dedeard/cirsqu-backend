import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import Stripe from 'stripe';
import { AuthGuard } from '../../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  list(@Req() { user }: { user: IUser }, @Query() paginations: Stripe.PaginationParams) {
    return this.subscriptionsService.list(user.profile.subscription.customerId, paginations);
  }

  @Get(':id')
  find(@Req() { user }: { user: IUser }, @Param('id') id: string) {
    return this.subscriptionsService.find(user.profile.subscription.customerId, id);
  }
}
