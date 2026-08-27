import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RequireBoardRole } from 'src/common/decorators/roles.decorator';
import { BoardRolesGuard } from 'src/common/guards/board-roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@UseGuards(JwtAuthGuard, BoardRolesGuard)
@Controller('tasks/:taskId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequireBoardRole('member')
  create(
    @CurrentUser('id') userId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(userId, taskId, dto);
  }
}

@UseGuards(JwtAuthGuard, BoardRolesGuard)
@Controller('comments/:commentId')
export class CommentItemController {
  constructor(private readonly commentsService: CommentsService) {}

  @Patch()
  @RequireBoardRole('member')
  update(
    @CurrentUser('id') userId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.update(userId, commentId, dto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequireBoardRole('member')
  async remove(
    @CurrentUser('id') userId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
  ): Promise<void> {
    await this.commentsService.remove(userId, commentId);
  }
}
