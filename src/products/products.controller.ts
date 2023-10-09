import { Controller, Get, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list() {
    return this.productsService.list();
  }

  @Get(':lookup_key')
  find(@Param('lookup_key') lookupKey: string) {
    return this.productsService.findByLookupKey(lookupKey);
  }
}
