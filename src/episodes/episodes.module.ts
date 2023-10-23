import { Module } from '@nestjs/common';
import { EpisodesRepository } from './episodes.repository';
import { EpisodesService } from './episodes.service';
import { EpisodesController } from './episodes.controller';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [EpisodesController],
  providers: [EpisodesRepository, EpisodesService],
  exports: [EpisodesRepository, EpisodesService],
})
export class EpisodesModule {}
