import { Injectable } from '@nestjs/common';
import { EpisodesRepository } from './episodes.repository';

@Injectable()
export class EpisodesService {
  constructor(private readonly episodesRepository: EpisodesRepository) {}
  async find(episodeId: string, user?: IUser) {
    const episode = await this.episodesRepository.findOrFail(episodeId);

    if (episode.data.premium && !user?.premium) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { videoId, downloadUrl, ...data } = episode.data;
      return {
        episodeId,
        ...data,
      };
    }

    if (!episode.data.premium && !user?.premium) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { downloadUrl, ...data } = episode.data;
      return {
        episodeId,
        ...data,
      };
    }

    return {
      episodeId,
      ...episode.data,
    };
  }
}
