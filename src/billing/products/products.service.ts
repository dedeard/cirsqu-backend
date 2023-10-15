import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { StripeService } from '../../common/services/stripe.service';

@Injectable()
export class ProductsService {
  private readonly LOOKUP_KEYS = ['monthly', 'yearly', 'lifetime'];
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly stripe: StripeService) {}

  async list() {
    try {
      const prices = await this.stripe.prices.list({ active: true, lookup_keys: this.LOOKUP_KEYS });
      const productIds = prices.data.map((price) => price.product.toString());

      const products = await this.stripe.products.list({ active: true, ids: productIds });

      if (products.data.length !== this.LOOKUP_KEYS.length) {
        throw new InternalServerErrorException('Mismatch between number of products and lookup keys');
      }

      return products.data
        .map((product) => ({
          ...product,
          price: prices.data.find((price) => price.product.toString() === product.id),
        }))
        .sort((a, b) => a.price.unit_amount - b.price.unit_amount);
    } catch (error) {
      this.logger.error(`Failed to list products due to ${error.message}`);

      // rethrow the error so that it can be handled upstream
      throw error;
    }
  }

  async findByLookupKey(lookupKey: string) {
    try {
      const prices = await this.stripe.prices.list({ active: true, lookup_keys: [lookupKey] });
      const price = prices.data[0];

      if (!price) {
        throw new NotFoundException('Product not found');
      }

      const product = await this.stripe.products.retrieve(price.product.toString());

      if (!product || 'deleted' in product) {
        throw new Error('Product has been deleted');
      }

      // Retrieve associated price
      return { ...product, price };
    } catch (error) {
      this.logger.error(`Failed to retrieve product with key ${lookupKey}: ${error.message}`);

      // rethrow the error so that it can be handled upstream
      throw error;
    }
  }
}
