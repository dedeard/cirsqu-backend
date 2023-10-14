import dotenv from 'dotenv';
import Stripe from 'stripe';
import products from './products';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-08-16' });

const main = async () => {
  const existingProducts = await stripe.products.list({ limit: 100, active: true });
  const existingPrices = await stripe.prices.list({ limit: 100, active: true });

  for (const product of products) {
    const existingProduct = existingProducts.data.find((el) => el.name == product.name);

    let remoteProduct: Stripe.Response<Stripe.Product>;

    if (existingProduct) {
      remoteProduct = await stripe.products.update(existingProduct.id, {
        name: product.name,
        description: product.description,
        features: product.features.map((name) => ({ name })),
        active: true,
      });
    } else {
      remoteProduct = await stripe.products.create({
        name: product.name,
        description: product.description,
        features: product.features.map((name) => ({ name })),
      });
    }

    const existingPrice = existingPrices.data.find((el) => el.product === remoteProduct.id);
    if (existingPrice) {
      await stripe.prices.update(existingPrice.id, {
        lookup_key: product.price.lookup_key,
        active: true,
      });
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      await stripe.prices.create({
        product: remoteProduct.id,
        ...product.price,
      });
    }
  }
};

main().catch((e) => {
  console.log(e);
});
