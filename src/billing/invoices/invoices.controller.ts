import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import Stripe from 'stripe';
import { AuthProfileGuard } from '../../auth/guards/auth-profile.guard';

@UseGuards(AuthProfileGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  list(@Req() { user }: { user: IUser }, @Query() paginations: Stripe.PaginationParams) {
    return this.invoicesService.list(user.profile.subscription.customerId, paginations);
  }

  @Get(':id')
  find(@Req() { user }: { user: IUser }, @Param('id') id: string) {
    return this.invoicesService.find(user.profile.subscription.customerId, id);
  }
}
