import { BadGatewayException, BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { StripeService } from '../../common/services/stripe.service';
import { ConfigService } from '@nestjs/config';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import Stripe from 'stripe';

@Injectable()
export class CheckoutSessionsService {
  private readonly logger = new Logger(CheckoutSessionsService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly stripe: StripeService,
  ) {}

  async validateSubscriptionCreation(customerId: string, priceId: string) {
    const customerSubscriptions = await this.stripe.subscriptions.list({ customer: customerId });

    // Check if a subscription with the given priceId already exists
    if (customerSubscriptions.data.some((subscription) => subscription.items.data.find((el) => el.price?.id === priceId))) {
      throw new BadRequestException('A subscription with this price ID already exists for the customer.');
    }

    // Check if there are any active subscriptions that aren't set to cancel
    if (customerSubscriptions.data.some((subscription) => !subscription.cancel_at)) {
      throw new BadRequestException(
        'The customer already has an active subscription. Please cancel the existing subscription before creating a new one.',
      );
    }
  }

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

  async list(customerId: string, pagination?: Stripe.PaginationParams) {
    try {
      return await this.stripe.checkoutSessions.list({ customer: customerId, ...pagination });
    } catch (error: any) {
      this.logger.error(`Failed to list checkout sessions for customer ${customerId}: ${error.message}`);

      throw new BadGatewayException('Unable to fetch checkout session list');
    }
  }

  async find(customerId: string, sessionId: string) {
    try {
      const session = await this.stripe.checkoutSessions.retrieve(sessionId);

      if (!session || session?.customer !== customerId) throw new Error('Checkout session not found');
      if ('deleted' in session) throw new Error('Checkout session has been deleted');

      return session;
    } catch (error: any) {
      this.logger.error(`Failed to retrieve Checkout session ${sessionId}: ${error.message}`);

      throw new NotFoundException('Invalid Checkout session ID provided');
    }
  }

  async create(customerId: string, { priceId }: CreateCheckoutSessionDto) {
    const price = await this.findPrice(priceId);
    await this.validateSubscriptionCreation(customerId, priceId);

    try {
      return await this.stripe.checkoutSessions.create({
        billing_address_collection: 'auto',
        line_items: [{ price: priceId, quantity: 1 }],
        customer: customerId,
        mode: price.recurring ? 'subscription' : 'payment',
        cancel_url: `${this.config.get('FRONTEND_URL', 'http://localhost:3001')}/pro/checkout?plan=${price.lookup_key}&cancel=true`,
        success_url: `${this.config.get('FRONTEND_URL', 'http://localhost:3001')}/pro/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      });
    } catch (error: any) {
      this.logger.error(`Failed to create checkout session for customer ${customerId}: ${error.message}`);

      throw error;
    }
  }
}