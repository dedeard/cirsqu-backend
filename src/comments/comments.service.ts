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

    await this.commentsRepository.create({
      userId,
      targetId,
      targetType,
      body,
      likes: [],
    });
  }

  async update(userId: string, commentId: string, { body }: UpdateCommentDto) {
    const comment = await this.commentsRepository.findOrFail(commentId);
    if (comment.data.userId !== userId) {
      throw new NotFoundException("You don't have permission to update this comment as it doesn't belong to you.");
    }

    await this.commentsRepository.update(commentId, { body });
  }

  async destroy(userId: string, commentId: string) {
    const comment = await this.commentsRepository.findOrFail(commentId);
    if (comment.data.userId !== userId) {
      throw new NotFoundException("You don't have permission to delete this comment as it doesn't belong to you.");
    }

    await this.commentsRepository.destroy(commentId);
  }

  async like(userId: string, commentId: string) {
    const comment = await this.commentsRepository.findOrFail(commentId);
    if (comment.data.userId === userId) {
      throw new BadRequestException("Oops! You can't give a 'like' to your own comment.");
    }

    const liked = comment.data.likes.find((el) => el === userId);
    if (liked) return;

    const likes = [...comment.data.likes, userId];
    await this.commentsRepository.update(commentId, { likes }, true);
  }

  async unlike(userId: string, commentId: string) {
    const comment = await this.commentsRepository.findOrFail(commentId);
    if (comment.data.userId === userId) {
      throw new BadRequestException("Oops! You can't give a 'unlike' to your own comment.");
    }

    const liked = comment.data.likes.find((el) => el === userId);
    if (!liked) return;

    const likes = comment.data.likes.filter((el) => el !== userId);
    await this.commentsRepository.update(commentId, { likes }, true);
  }
}
