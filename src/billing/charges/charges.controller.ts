import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ChargesService } from './charges.service';
import Stripe from 'stripe';
import { AuthProfileGuard } from 'src/auth/guards/auth-profile.guard';

@UseGuards(AuthProfileGuard)
@Controller('charges')
export class ChargesController {
  constructor(private readonly chargesService: ChargesService) {}

  @Get()
  list(@Req() { user }: { user: IUser }, @Query() paginations: Stripe.PaginationParams) {
    return this.chargesService.list(user.profile.stripeCustomerId, paginations);
  }

  @Get(':id')
  find(@Req() { user }: { user: IUser }, @Param('id') id: string) {
    return this.chargesService.find(user.profile.stripeCustomerId, id);
  }
}
