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

  async validateCanCreateSubscription(user: IUser, priceId: string) {
    const { subscriptions } = user.profile;
    if (!subscriptions) return true;

    const lifetimeSub = subscriptions.find((s) => !s.recurring && s.status === 'succeeded');
    const alreadyExistsSub = subscriptions.find((s) => s.priceId === priceId);
    const recurringSub = subscriptions.find((s) => s.recurring && s.status === 'active' && !s.cancelAt);

    if (lifetimeSub) {
      throw new BadRequestException('You already have a non-recurring subscription.');
    }

    if (alreadyExistsSub) {
      throw new BadRequestException('You are already subscribed to this product.');
    }

    if (recurringSub) {
      throw new BadRequestException('You have an active recurring subscription. Please cancel it before creating a new one.');
    }

    return true;
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

  async list(user: IUser, pagination?: Stripe.PaginationParams) {
    try {
      return await this.stripe.checkoutSessions.list({ customer: user.profile.stripeCustomerId, ...pagination });
    } catch (error: any) {
      this.logger.error(`Failed to list checkout sessions for customer ${user.profile.stripeCustomerId}: ${error.message}`);

      throw new BadGatewayException('Unable to fetch checkout session list');
    }
  }

  async find(user: IUser, sessionId: string) {
    try {
      const session = await this.stripe.checkoutSessions.retrieve(sessionId);

      if (!session || session?.customer !== user.profile.stripeCustomerId) throw new Error('Checkout session not found');
      if ('deleted' in session) throw new Error('Checkout session has been deleted');

      return session;
    } catch (error: any) {
      this.logger.error(`Failed to retrieve Checkout session ${sessionId}: ${error.message}`);

      throw new NotFoundException('Invalid Checkout session ID provided');
    }
  }

  async create(user: IUser, { priceId }: CreateCheckoutSessionDto) {
    const price = await this.findPrice(priceId);
    await this.validateCanCreateSubscription(user, priceId);

    try {
      return await this.stripe.checkoutSessions.create({
        billing_address_collection: 'auto',
        line_items: [{ price: priceId, quantity: 1 }],
        customer: user.profile.stripeCustomerId,
        mode: price.recurring ? 'subscription' : 'payment',
        cancel_url: `${this.config.get('FRONTEND_URL', 'http://localhost:3001')}/pro/checkout?plan=${price.lookup_key}&cancel=true`,
        success_url: `${this.config.get('FRONTEND_URL', 'http://localhost:3001')}/pro/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      });
    } catch (error: any) {
      this.logger.error(`Failed to create checkout session for customer ${user.profile.stripeCustomerId}: ${error.message}`);

      throw error;
    }
  }
}
