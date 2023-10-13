import { Request } from 'express';
import { Controller, Headers, Post, RawBodyRequest, Req } from '@nestjs/common';
import { StripeWebhookService } from './stripe-webhook.service';

@Controller('stripe-webhook')
export class StripeWebhookController {
  constructor(private readonly stripeWebhookService: StripeWebhookService) {}

  @Post()
  handler(@Headers('stripe-signature') signature: string, @Req() req: RawBodyRequest<Request>) {
    return this.stripeWebhookService.handler(signature, req.rawBody);
  }
}
