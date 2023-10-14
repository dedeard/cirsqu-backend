import Stripe from 'stripe';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { AuthProfileGuard } from '../../auth/guards/auth-profile.guard';

@UseGuards(AuthProfileGuard)
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Get()
  list(@Req() { user }: { user: IUser }, @Query() paginations: Stripe.PaginationParams) {
    return this.paymentMethodsService.list(user.profile.subscription.customerId, paginations);
  }

  @Get(':id')
  find(@Req() { user }: { user: IUser }, @Param('id') id: string) {
    return this.paymentMethodsService.find(user.profile.subscription.customerId, id);
  }

  @Post(':id')
  attach(@Req() { user }: { user: IUser }, @Param('id') paymentMethodId: string) {
    return this.paymentMethodsService.attach(user.profile.subscription.customerId, paymentMethodId);
  }

  @Put(':id')
  update(@Req() { user }: { user: IUser }, @Param('id') paymentMethodId: string, @Body() body: Stripe.PaymentMethodUpdateParams) {
    return this.paymentMethodsService.update(user.profile.subscription.customerId, paymentMethodId, body);
  }

  @Delete(':id')
  detach(@Req() { user }: { user: IUser }, @Param('id') paymentMethodId: string) {
    return this.paymentMethodsService.detach(user.profile.subscription.customerId, paymentMethodId);
  }
}
