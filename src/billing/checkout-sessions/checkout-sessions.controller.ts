import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CheckoutSessionsService } from './checkout-sessions.service';
import { AuthProfileGuard } from '../../auth/guards/auth-profile.guard';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@UseGuards(AuthProfileGuard)
@Controller('checkout-sessions')
export class CheckoutSessionsController {
  constructor(private readonly checkoutSessionsService: CheckoutSessionsService) {}

  @Post()
  create(@Req() { user }: { user: IUser }, @Body() data: CreateCheckoutSessionDto) {
    return this.checkoutSessionsService.create(user.profile.stripeCustomerId, data);
  }
}
