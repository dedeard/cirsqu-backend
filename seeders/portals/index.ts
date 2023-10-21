import Stripe from 'stripe';
import getRawPortalConfiguration from './raw-portal-configuration';
import rawProducts from '../products/raw-products';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-08-16' });

const getAllowedPrices = (prices: Stripe.Price[]) => {
  const allowedKeys = rawProducts.filter((el) => el.price.recurring).map((el) => el.price.lookup_key);
  return prices
    .filter((price) => allowedKeys.includes(price.lookup_key))
    .map((price) => ({ product: price.product.toString(), prices: [price.id] }));
};

const findConfiguration = (configs: Stripe.BillingPortal.Configuration[], identifier: string | number) =>
  configs.find((el) => el.metadata.identifier === identifier);

export default async function initConfiguration() {
  try {
    const prices = await stripe.prices.list({ limit: 100, active: true });
    const rawPortal = getRawPortalConfiguration(getAllowedPrices(prices.data));

    const configs = await stripe.billingPortal.configurations.list({ limit: 100 });

    const config = findConfiguration(configs.data, rawPortal.metadata.identifier);

    if (config) {
      console.log('Updating protal configuration:', config.id);
      await stripe.billingPortal.configurations.update(config.id, rawPortal);
    } else {
      console.log('Creating protal configuration:', rawPortal.metadata.identifier);
      await stripe.billingPortal.configurations.create(rawPortal);
    }
  } catch (error) {
    console.error(error.message);
  }
}
