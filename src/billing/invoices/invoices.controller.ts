import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { AuthGuard } from '../../auth/auth.guard';
import Stripe from 'stripe';

@UseGuards(AuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  list(@Req() { user }: { user: IUser }, @Query() { limit, starting_after, ending_before }: Stripe.PaginationParams) {
    return this.invoicesService.list(user.profile.subscription.customerId, { limit, starting_after, ending_before });
  }
}
