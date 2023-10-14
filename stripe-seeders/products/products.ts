export default [
  {
    name: 'Monthly Membership',
    description: 'Stay flexible with our affordable monthly subscription option, cancel anytime',
    features: ['Unlimited streaming of premium content', 'Download videos for offline viewing', 'Full access to source code and resources'],
    price: {
      billing_scheme: 'per_unit',
      currency: 'usd',
      lookup_key: 'monthly',
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
      unit_amount: 1200,
    },
  },
  {
    name: 'Annual Membership',
    description: 'Gain year-round access with our cost-effective yearly subscription',
    features: [
      'Save 36% ($52) compared to the monthly plan',
      'Unlimited streaming of exclusive content',
      'Download videos for offline viewing',
      'Full access to source code and resources',
    ],
    price: {
      billing_scheme: 'per_unit',
      currency: 'usd',
      lookup_key: 'yearly',
      recurring: {
        interval: 'year',
        interval_count: 1,
      },
      unit_amount: 9200,
    },
  },
  {
    name: 'Lifetime Membership',
    description: 'Enjoy unlimited access for a lifetime with a one-time payment',
    features: ['One-time payment for lifelong access', 'All-inclusive features and benefits'],
    price: {
      billing_scheme: 'per_unit',
      currency: 'usd',
      lookup_key: 'lifetime',
      unit_amount: 34900,
    },
  },
];
