import Stripe from 'stripe';
import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CheckoutSessionsService } from './checkout-sessions.service';
import { AuthProfileGuard } from '../../auth/guards/auth-profile.guard';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@UseGuards(AuthProfileGuard)
@Controller('checkout-sessions')
export class CheckoutSessionsController {
  constructor(private readonly checkoutSessionsService: CheckoutSessionsService) {}

  @Get()
  list(@Req() { user }: { user: IUser }, @Query() paginations: Stripe.PaginationParams) {
    return this.checkoutSessionsService.list(user, paginations);
  }

  @Get(':id')
  find(@Req() { user }: { user: IUser }, @Param('id') sessionId: string) {
    return this.checkoutSessionsService.find(user, sessionId);
  }

  @Post()
  create(@Req() { user }: { user: IUser }, @Body() data: CreateCheckoutSessionDto) {
    return this.checkoutSessionsService.create(user, data);
  }
}
