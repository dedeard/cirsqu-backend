import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { EpisodesRepository } from '../episodes/episodes.repository';
import { CommentsRepository } from './comments.repository';
import { NotificationsService } from '../common/services/notifications.service';

@Injectable()
export class CommentsService {
  constructor(
    private readonly episodesRepository: EpisodesRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(userId: string, { targetId, targetType, body }: CreateCommentDto) {
    let replyTarget: { id: string; data: IComment } | null = null;
    switch (targetType) {
      case 'episode':
        await this.episodesRepository.findOrFail(targetId);
        break;
      case 'reply':
        replyTarget = await this.commentsRepository.findOrFail(targetId);
        break;
      default:
        throw new BadRequestException('Target type is not valid.');
    }

    const docId = await this.commentsRepository.create({
      userId,
      targetId,
      targetType,
      body,
      likes: [],
    });

    if (replyTarget) {
      await this.notificationsService.onReply(replyTarget.data.userId, {
        userId,
        commentId: replyTarget.id,
        replyId: docId,
      });
    }
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

    await this.notificationsService.onLike(comment.data.userId, {
      userId,
      commentId: comment.id,
    });
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
