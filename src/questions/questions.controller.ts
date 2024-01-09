import { Body, Controller, Delete, Param, Post, Req, UseGuards } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@UseGuards(AuthGuard)
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  store(@Req() { user }: { user: IUser }, @Body() data: CreateQuestionDto) {
    return this.questionsService.store(user, data);
  }

  @Post(':slug')
  update(@Req() { user }: { user: IUser }, @Body() data: UpdateQuestionDto, @Param('slug') slug: string) {
    return this.questionsService.update(slug, user, data);
  }

  @Delete(':slug')
  destroy(@Req() { user }: { user: IUser }, @Param('slug') slug: string) {
    return this.questionsService.destroy(slug, user);
  }

  @Post(':slug/like')
  likeToggle(@Req() { user }: { user: IUser }, @Param('slug') slug: string) {
    return this.questionsService.likeToggle(slug, user);
  }
}
