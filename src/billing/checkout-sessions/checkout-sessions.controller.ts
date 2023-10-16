import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CheckoutSessionsService } from './checkout-sessions.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { AuthGuard } from '../../auth/auth.guard';
import { AuthMetaData } from '../../auth/auth-metadata.guard';

@UseGuards(AuthGuard)
@Controller('checkout-sessions')
export class CheckoutSessionsController {
  constructor(private readonly checkoutSessionsService: CheckoutSessionsService) {}

  @Get(':id')
  @AuthMetaData('skip')
  find(@Param('id') sessionId: string) {
    return this.checkoutSessionsService.find(sessionId);
  }

  @Post()
  create(@Req() { user }: { user: IUser }, @Body() data: CreateCheckoutSessionDto) {
    return this.checkoutSessionsService.create(user, data);
  }
}
