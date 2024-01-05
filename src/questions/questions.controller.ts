import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateQuestionDto } from './dto/create-question.dto';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @UseGuards(AuthGuard)
  @Post(':episode_id')
  store(@Req() { user }: { user: IUser }, @Body() data: CreateQuestionDto) {
    return this.questionsService.store(user, data);
  }
}
