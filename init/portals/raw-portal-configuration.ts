import Stripe from 'stripe';

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';

export default function getRawPortalConfiguration(
  products: Stripe.Emptyable<Stripe.BillingPortal.ConfigurationCreateParams.Features.SubscriptionUpdate.Product[]>,
) {
  const rawPortal: Stripe.BillingPortal.ConfigurationCreateParams = {
    business_profile: {
      headline: 'CIRSQU partners with Stripe for simplified billing.',
      privacy_policy_url: frontendUrl + '/privacy-policy',
      terms_of_service_url: frontendUrl + '/terms-of-service',
    },
    default_return_url: frontendUrl + '/account/subscription',
    features: {
      customer_update: { enabled: false },
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_cancel: {
        cancellation_reason: {
          enabled: true,
          options: [
            'too_expensive',
            'switched_service',
            'unused',
            'other',
            'missing_features',
            'low_quality',
            'too_complex',
            'customer_service',
          ],
        },
        enabled: true,
        mode: 'immediately',
        proration_behavior: 'create_prorations',
      },
      subscription_pause: { enabled: true },
      subscription_update: {
        default_allowed_updates: ['price', 'promotion_code'],
        enabled: true,
        proration_behavior: 'always_invoice',
        products,
      },
    },
    login_page: { enabled: false },
    metadata: {
      indentifier: 'cirsqu-portal',
    },
  };

  return rawPortal;
}
