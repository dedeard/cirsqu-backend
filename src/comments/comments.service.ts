import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { EpisodesRepository } from '../episodes/episodes.repository';
import { CommentsRepository } from './comments.repository';

@Injectable()
export class CommentsService {
  constructor(
    private readonly episodesRepository: EpisodesRepository,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async create(userId: string, { targetId, targetType, body }: CreateCommentDto) {
    switch (targetType) {
      case 'episode':
        await this.episodesRepository.findOrFail(targetId);
        break;
      case 'reply':
        await this.commentsRepository.findOrFail(targetId);
        break;
      default:
        throw new BadRequestException('Target type is not valid.');
    }

    const snapshot = await this.commentsRepository.create({
      userId,
      targetId,
      targetType,
      body,
      likes: [],
    });

    return { commentId: snapshot.id };
  }

  async update(userId: string, commentId: string, { body }: UpdateCommentDto) {
    const comment = await this.commentsRepository.findOrFail(commentId);
    if (comment.data.userId !== userId) {
      throw new NotFoundException('This commet is not yours');
    }

    await this.commentsRepository.update(commentId, { body });
  }

  async like(userId: string, commentId: string) {
    const comment = await this.commentsRepository.findOrFail(commentId);
    if (comment.data.userId === userId) {
      throw new BadRequestException('You cant like your own comment.');
    }

    const liked = comment.data.likes.find((el) => el === userId);
    if (liked) return;

    const likes = [...comment.data.likes, userId];
    await this.commentsRepository.update(commentId, { likes });
  }

  async unlike(userId: string, commentId: string) {
    const comment = await this.commentsRepository.findOrFail(commentId);
    if (comment.data.userId === userId) {
      throw new BadRequestException('You cant like your oun comment.');
    }

    const liked = comment.data.likes.find((el) => el === userId);
    if (!liked) return;

    const likes = comment.data.likes.filter((el) => el !== userId);
    await this.commentsRepository.update(commentId, { likes });
  }
}
