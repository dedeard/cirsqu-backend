import { Controller, Get, Param } from '@nestjs/common';
import { PlansService } from './plans.service';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  findAll() {
    return this.plansService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.plansService.findOneBySlug(slug);
  }
}
