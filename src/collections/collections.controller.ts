import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post()
  create(@Req() { user }: { user: IUser }, @Body() { lessonId }: { lessonId?: string }) {
    return this.collectionsService.create(user.uid, lessonId);
  }
}
