import { Injectable } from '@nestjs/common';
import { StripeService } from '../common/services/stripe.service';
import formatAmount from 'src/common/utils/format-amount';
import { ConfigService } from '@nestjs/config';
import PLAN_DETAILS from 'src/common/constants/plan-details';
import Stripe from 'stripe';

export interface IPlan {
  id: string;
  slug: string;
  currency: string;
  livemode: boolean;
  nickname: string;
  recurring: {
    interval: string;
    interval_count: number;
  } | null;
  amount: {
    formatted: string;
    decimal: string;
  };
  description: string;
  features: string[];
}

@Injectable()
export class PlansService {
  private readonly productId: string;
  constructor(
    private readonly stripe: StripeService,
    private readonly config: ConfigService,
  ) {
    this.productId = config.getOrThrow('STRIPE_PRODUCT_ID');
  }

  static transform(price: Stripe.Price): IPlan {
    return {
      id: price.id,
      slug: price.lookup_key || price.id,
      currency: price.currency,
      livemode: price.livemode,
      nickname: price.nickname,
      recurring: price.recurring
        ? {
            interval: price.recurring.interval,
            interval_count: price.recurring.interval_count,
          }
        : null,
      amount: {
        formatted: formatAmount(price.unit_amount, price.currency),
        decimal: (price.unit_amount / 100).toFixed(2),
      },
      ...PLAN_DETAILS[price.lookup_key],
    };
  }

  async findAll() {
    const { data } = await this.stripe.prices.list({ product: this.productId, active: true });
    return data.sort((a, b) => a.unit_amount - b.unit_amount).map(PlansService.transform);
  }

  async findOneBySlug(slug: string) {
    const { data } = await this.stripe.prices.list({ product: this.productId, active: true, lookup_keys: [slug] });
    return data.map(PlansService.transform)[0];
  }
}
