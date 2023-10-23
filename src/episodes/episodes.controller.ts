import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { EpisodesService } from './episodes.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('episodes')
export class EpisodesController {
  constructor(private readonly episodesService: EpisodesService) {}

  @Get(':episode_id')
  find(@Req() { user }: { user: IUser }, @Param('episode_id') episodeId: string) {
    return this.episodesService.find(user, episodeId);
  }
}
