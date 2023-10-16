import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StripeService } from '../../common/services/stripe.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@Injectable()
export class CheckoutSessionsService {
  private readonly logger = new Logger(CheckoutSessionsService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly stripe: StripeService,
  ) {}

  async throwIfCantCreateSubscription(user: IUser, recurring: boolean) {
    const { subscription } = user.profile;

    if (subscription.lifetime?.paymentIntentStatus === 'succeeded') {
      throw new BadRequestException('You already have a lifetime subscription. No need to subscribe again.');
    }

    if (recurring) {
      const existingSubscriptionId = subscription.recurring?.subscriptionId;
      if (existingSubscriptionId) {
        throw new BadRequestException(
          `You are already subscribed to a recurring plan. There's no need to subscribe again. However, you can manage, update, or cancel your subscription through the portal page.`,
        );
      }
    } else {
      const existingRecurringStatus = subscription.recurring?.subscriptionStatus;
      if (existingRecurringStatus && existingRecurringStatus !== 'canceled') {
        throw new BadRequestException(
          'You currently have an active recurring subscription. Please cancel that before subscribing to a non-recurring plan.',
        );
      }
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

  private async getSession(sessionId: string) {
    const session = await this.stripe.checkoutSessions.retrieve(sessionId);

    if (!session || 'deleted' in session) throw new Error('Checkout session not found or has been deleted');

    return session;
  }

  private async getInvoice(session: any) {
    const invoice = await this.stripe.invoices.retrieve(session.invoice.toString());
    return { session, invoice };
  }

  private async getPaymentIntent(session: any) {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(session.payment_intent.toString());

    if (paymentIntent.latest_charge) {
      const charge = await this.stripe.charges.retrieve(paymentIntent.latest_charge.toString());
      return { session, paymentIntent, charge };
    }

    return { session, paymentIntent };
  }

  async find(sessionId: string) {
    try {
      const session = await this.getSession(sessionId);

      if (session.invoice) {
        return this.getInvoice(session);
      } else if (session.payment_intent) {
        return this.getPaymentIntent(session);
      }

      throw new Error('No invoice or payment intent found in the session');
    } catch (error: any) {
      this.logger.error(`Failed to retrieve Checkout session ${sessionId}: ${error.message}`);
      throw new NotFoundException('Invalid Checkout session ID provided');
    }
  }

  async create(user: IUser, { priceId }: CreateCheckoutSessionDto) {
    const price = await this.findPrice(priceId);
    await this.throwIfCantCreateSubscription(user, !!price.recurring);

    try {
      return await this.stripe.checkoutSessions.create({
        billing_address_collection: 'auto',
        line_items: [{ price: priceId, quantity: 1 }],
        customer: user.profile.subscription.customerId,
        mode: price.recurring ? 'subscription' : 'payment',
        cancel_url: `${this.config.get('FRONTEND_URL', 'http://localhost:3001')}/pro/checkout?plan=${price.lookup_key}&cancel=true`,
        success_url: `${this.config.get('FRONTEND_URL', 'http://localhost:3001')}/pro/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      });
    } catch (error: any) {
      this.logger.error(`Failed to create checkout session for customer ${user.profile.subscription.customerId}: ${error.message}`);

      throw error;
    }
  }
}
