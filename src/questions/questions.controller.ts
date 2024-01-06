import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @UseGuards(AuthGuard)
  @Post()
  store(@Req() { user }: { user: IUser }, @Body() data: CreateQuestionDto) {
    return this.questionsService.store(user, data);
  }

  @UseGuards(AuthGuard)
  @Post(':slug')
  update(@Req() { user }: { user: IUser }, @Body() data: UpdateQuestionDto, @Param('slug') slug: string) {
    return this.questionsService.update(slug, user, data);
  }
}
