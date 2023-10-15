import Stripe from 'stripe';
import products from './raw-products';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-08-16' });

const createOrUpdateProduct = async (product) => {
  const existingProducts = await stripe.products.list({ limit: 100, active: true });
  const existingProduct = existingProducts.data.find((el) => el.name === product.name);

  if (existingProduct) {
    const updatedProduct = await stripe.products.update(existingProduct.id, {
      name: product.name,
      description: product.description,
      features: product.features.map((name) => ({ name })),
      active: true,
    });
    console.log('Updated product:', updatedProduct.name);
    return updatedProduct;
  } else {
    const newProduct = await stripe.products.create({
      name: product.name,
      description: product.description,
      features: product.features.map((name) => ({ name })),
    });
    console.log('Created product:', newProduct.name);
    return newProduct;
  }
};

const createOrUpdatePrice = async (product, productId) => {
  const existingPrices = await stripe.prices.list({ limit: 100, active: true });

  const existingPrice = existingPrices.data.find((el) => el.product === productId);

  if (existingPrice) {
    const priceUpdateResponse = await stripe.prices.update(existingPrice.id, {
      lookup_key: product.price.lookup_key,
      active: true,
    });
    console.log('Updated price:', priceUpdateResponse.lookup_key);
  } else {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-error
    const priceCreateResponse = await stripe.prices.create({
      ...product.price,
      product: productId,
    });

    console.log('Created price:', priceCreateResponse.lookup_key);
  }
};

export default async function initProducts() {
  try {
    for (const item of products) {
      const remoteProductId = (await createOrUpdateProduct(item)).id;
      await createOrUpdatePrice(item, remoteProductId);
    }
  } catch (error) {
    console.error(error.message);
  }
}
