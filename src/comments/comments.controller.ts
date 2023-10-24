import { Controller, Post, Body, Put, Param, UseGuards, Req, Delete } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@Req() { user }: { user: IUser }, @Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(user.uid, createCommentDto);
  }

  @Put(':comment_id')
  update(@Req() { user }: { user: IUser }, @Param('comment_id') commentId: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(user.uid, commentId, updateCommentDto);
  }

  @Delete(':comment_id')
  destroy(@Req() { user }: { user: IUser }, @Param('comment_id') commentId: string) {
    return this.commentsService.destroy(user.uid, commentId);
  }

  @Post(':comment_id/like')
  like(@Req() { user }: { user: IUser }, @Param('comment_id') commentId: string) {
    return this.commentsService.like(user.uid, commentId);
  }

  @Delete(':comment_id/unlike')
  unlike(@Req() { user }: { user: IUser }, @Param('comment_id') commentId: string) {
    return this.commentsService.unlike(user.uid, commentId);
  }
}
