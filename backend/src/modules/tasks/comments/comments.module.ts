import { Module } from '@nestjs/common';
import {
  CommentItemController,
  CommentsController,
} from './comments.controller';
import { CommentsRepository } from './comments.repository';
import { CommentsService } from './comments.service';

@Module({
  controllers: [CommentsController, CommentItemController],
  providers: [CommentsRepository, CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
