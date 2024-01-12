import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { CommentsRepository } from './comments.repository';
import { CommonModule } from '../common/common.module';
import { EpisodesModule } from '../episodes/episodes.module';
import { QuestionsModule } from '../questions/questions.module';

@Module({
  imports: [CommonModule, EpisodesModule, QuestionsModule],
  controllers: [CommentsController],
  providers: [CommentsRepository, CommentsService],
  exports: [CommentsRepository, CommentsService],
})
export class CommentsModule {}
