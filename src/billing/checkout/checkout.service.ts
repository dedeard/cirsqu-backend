import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { StripeService } from '../../common/services/stripe.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly stripe: StripeService,
  ) {}

  async findPrice(priceId: string) {
    try {
      const price = await this.stripe.prices.retrieve(priceId);

      if (!price) throw new Error('Price not found');
      if ('deleted' in price) throw new Error('Price has been deleted');

      return price;
    } catch (error: any) {
      this.logger.error(`Failed to retrieve price ${priceId}: ${error.message}`);

      throw new NotFoundException('Invalid price ID provided');
    }
  }

  async create(customerId: string, priceId: string) {
    const price = await this.findPrice(priceId);

    try {
      return await this.stripe.checkoutSessions.create({
        billing_address_collection: 'auto',
        line_items: [{ price: priceId, quantity: 1 }],
        customer: customerId,
        mode: price.recurring ? 'subscription' : 'payment',
        cancel_url: `${this.config.get('FRONTEND_URL', 'http://localhost:3001')}/plans?cancel=true`,
        success_url: `${this.config.get('FRONTEND_URL', 'http://localhost:3001')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      });
    } catch (error: any) {
      this.logger.error(`Failed to create checkout session for customer ${customerId}: ${error.message}`);

      throw error;
    }
  }
}
