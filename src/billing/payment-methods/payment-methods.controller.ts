import { Body, Controller, Delete, Get, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { AuthProfileGuard } from '../../auth/guards/auth-profile.guard';

@UseGuards(AuthProfileGuard)
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Get()
  first(@Req() { user }: { user: IUser }) {
    return this.paymentMethodsService.first(user.profile.stripeCustomerId);
  }

  @Post()
  attach(@Req() { user }: { user: IUser }, @Query('id') paymentMethodId: string) {
    return this.paymentMethodsService.attach(user.profile.stripeCustomerId, paymentMethodId);
  }

  @Put()
  update(@Req() { user }: { user: IUser }, @Query('id') paymentMethodId: string, @Body() body: any) {
    return this.paymentMethodsService.update(user.profile.stripeCustomerId, paymentMethodId, body);
  }

  @Delete()
  detach(@Req() { user }: { user: IUser }, @Query('id') paymentMethodId: string) {
    return this.paymentMethodsService.detach(user.profile.stripeCustomerId, paymentMethodId);
  }
}
