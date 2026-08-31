import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ActivityAction } from 'src/generated/prisma/enums';
import type { CommentModel } from 'src/generated/prisma/models';
import { ActivityService } from '../../activity/activity.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { CommentsRepository } from './comments.repository';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly activityService: ActivityService,
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  async create(
    userId: string,
    taskId: string,
    dto: CreateCommentDto,
  ): Promise<CommentModel> {
    const task = await this.commentsRepository.findTaskById(taskId);

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    const comment = await this.commentsRepository.create({
      taskId: task.id,
      userId,
      content: dto.content,
    });

    const taskWithBoard = await this.prisma.task.findUnique({
      where: { id: task.id },
      select: {
        id: true,
        boardId: true,
        board: { select: { workspaceId: true } },
      },
    });

    const workspaceId = taskWithBoard?.board.workspaceId;
    if (workspaceId) {
      await this.activityService.log({
        workspaceId,
        boardId: task.boardId,
        taskId: task.id,
        userId,
        action: ActivityAction.comment_created,
        metadata: { commentId: comment.id, content: dto.content },
      });

      const mentionedUserIds = await this.findMentionedUserIds(
        dto.content,
        workspaceId,
      );

      if (mentionedUserIds.length > 0) {
        await this.notificationsService.createMentionNotifications(
          mentionedUserIds,
          {
            id: task.id,
            title: task.title,
            boardId: task.boardId,
            workspaceId,
          },
        );
      }
    }

    return comment;
  }

  async update(
    userId: string,
    commentId: string,
    dto: UpdateCommentDto,
  ): Promise<CommentModel> {
    const comment = await this.findExisting(commentId);
    this.assertOwner(comment, userId);

    const updatedComment = await this.commentsRepository.update(
      comment.id,
      dto.content,
    );

    const task = await this.prisma.task.findUnique({
      where: { id: comment.taskId },
      select: {
        id: true,
        boardId: true,
        board: { select: { workspaceId: true } },
      },
    });

    if (task) {
      await this.activityService.log({
        workspaceId: task.board.workspaceId,
        boardId: task.boardId,
        taskId: task.id,
        userId,
        action: ActivityAction.comment_updated,
        metadata: { commentId: comment.id },
      });
    }

    return updatedComment;
  }

  async remove(userId: string, commentId: string): Promise<void> {
    const comment = await this.findExisting(commentId);
    this.assertOwner(comment, userId);

    await this.commentsRepository.delete(comment.id);

    const task = await this.prisma.task.findUnique({
      where: { id: comment.taskId },
      select: {
        id: true,
        boardId: true,
        board: { select: { workspaceId: true } },
      },
    });

    if (task) {
      await this.activityService.log({
        workspaceId: task.board.workspaceId,
        boardId: task.boardId,
        taskId: task.id,
        userId,
        action: ActivityAction.comment_deleted,
        metadata: { commentId: comment.id },
      });
    }
  }

  private async findMentionedUserIds(
    content: string,
    workspaceId: string,
  ): Promise<string[]> {
    const matches = [
      ...content.matchAll(/@([\w.%+-]+@[\w.-]+\.[A-Za-z]{2,})/g),
    ].map((match) => match[1].toLowerCase());

    if (matches.length === 0) {
      return [];
    }

    const users = await this.prisma.user.findMany({
      where: {
        email: { in: matches },
        workspaceMemberships: {
          some: { workspaceId },
        },
      },
      select: { id: true },
    });

    return users.map((user) => user.id);
  }

  private async findExisting(commentId: string): Promise<CommentModel> {
    const comment = await this.commentsRepository.findById(commentId);

    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    return comment;
  }

  private assertOwner(comment: CommentModel, userId: string): void {
    if (comment.userId !== userId) {
      throw new ForbiddenException(
        'Solo el autor puede modificar este comentario',
      );
    }
  }
}
