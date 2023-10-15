import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ChargesService } from './charges.service';
import { AuthGuard } from '../../auth/auth.guard';
import Stripe from 'stripe';

@UseGuards(AuthGuard)
@Controller('charges')
export class ChargesController {
  constructor(private readonly chargesService: ChargesService) {}

  @Get()
  list(@Req() { user }: { user: IUser }, @Query() paginations: Stripe.PaginationParams) {
    return this.chargesService.list(user.profile.subscription.customerId, paginations);
  }

  @Get(':id')
  find(@Req() { user }: { user: IUser }, @Param('id') id: string) {
    return this.chargesService.find(user.profile.subscription.customerId, id);
  }
}
