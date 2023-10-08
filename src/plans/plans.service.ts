import { Injectable } from '@nestjs/common';
import { StripeService } from '../common/services/stripe.service';
import formatAmount from 'src/common/utils/format-amount';
import { ConfigService } from '@nestjs/config';
import PLAN_DETAILS from 'src/common/constants/plan-details';

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

  async findAll() {
    const { data } = await this.stripe.prices.list({ product: this.productId, active: true });
    return data
      .sort((a, b) => a.unit_amount - b.unit_amount)
      .map((plan): IPlan => {
        return {
          id: plan.id,
          slug: plan.lookup_key || plan.id,
          currency: plan.currency,
          livemode: plan.livemode,
          nickname: plan.nickname,
          recurring: plan.recurring
            ? {
                interval: plan.recurring.interval,
                interval_count: plan.recurring.interval_count,
              }
            : null,
          amount: {
            formatted: formatAmount(plan.unit_amount, plan.currency),
            decimal: (plan.unit_amount / 100).toFixed(2),
          },
          ...PLAN_DETAILS[plan.lookup_key],
        };
      });
  }
}
