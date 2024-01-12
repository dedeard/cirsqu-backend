import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { QuestionsRepository } from './questions.repository';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [QuestionsController],
  exports: [QuestionsService, QuestionsRepository],
  providers: [QuestionsService, QuestionsRepository],
})
export class QuestionsModule {}
