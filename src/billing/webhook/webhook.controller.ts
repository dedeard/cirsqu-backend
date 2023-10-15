import { Request } from 'express';
import { Controller, Headers, Post, RawBodyRequest, Req } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  handler(@Headers('stripe-signature') signature: string, @Req() req: RawBodyRequest<Request>) {
    return this.webhookService.handler(signature, req.rawBody);
  }
}
