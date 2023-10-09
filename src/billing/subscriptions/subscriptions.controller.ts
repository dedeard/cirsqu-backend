import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { AuthProfileGuard } from '../../auth/guards/auth-profile.guard';

@UseGuards(AuthProfileGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  list(@Req() { user }: { user: IUser }, @Query() queries: any) {
    return this.subscriptionsService.list(user.profile.stripeCustomerId, queries);
  }

  @Post()
  create(@Req() { user }: { user: IUser }, @Query('lookup_key') lookupKey: string) {
    return this.subscriptionsService.create(user.profile.stripeCustomerId, lookupKey);
  }
}
