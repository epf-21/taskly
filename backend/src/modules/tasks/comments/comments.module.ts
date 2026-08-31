import { Module } from '@nestjs/common';
import { ActivityModule } from '../../activity/activity.module';
import { NotificationsModule } from '../../notifications/notifications.module';
import {
  CommentItemController,
  CommentsController,
} from './comments.controller';
import { CommentsRepository } from './comments.repository';
import { CommentsService } from './comments.service';

@Module({
  imports: [ActivityModule, NotificationsModule],
  controllers: [CommentsController, CommentItemController],
  providers: [CommentsRepository, CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
