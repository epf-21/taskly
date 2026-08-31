import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { NotificationModel } from 'src/generated/prisma/models';
import { NotificationType } from 'src/generated/prisma/enums';
import { NotificationsRepository } from './notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  findByUser(userId: string): Promise<NotificationModel[]> {
    return this.notificationsRepository.findByUser(userId);
  }

  async markAsRead(userId: string, id: string): Promise<NotificationModel> {
    const notification = await this.notificationsRepository.findById(id);

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notificación no encontrada');
    }

    return this.notificationsRepository.markRead(id, userId);
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    return this.notificationsRepository.markAllRead(userId);
  }

  async createForUser(
    userId: string,
    type: keyof typeof NotificationType,
    payload: Record<string, unknown>,
  ): Promise<NotificationModel> {
    return this.notificationsRepository.create({
      userId,
      type: NotificationType[type],
      payload,
    });
  }

  createAssignedNotification(
    userId: string,
    task: { id: string; title: string; boardId?: string | null; workspaceId?: string | null },
  ): Promise<NotificationModel> {
    return this.createForUser(userId, 'task_assigned', {
      taskId: task.id,
      taskTitle: task.title,
      boardId: task.boardId,
      workspaceId: task.workspaceId,
    });
  }

  createDueSoonNotification(
    userId: string,
    task: { id: string; title: string; dueDate?: Date | string | null; boardId?: string | null; workspaceId?: string | null },
  ): Promise<NotificationModel> {
    return this.createForUser(userId, 'task_due_soon', {
      taskId: task.id,
      taskTitle: task.title,
      dueDate: task.dueDate ?? null,
      boardId: task.boardId,
      workspaceId: task.workspaceId,
    });
  }

  async createMentionNotifications(
    userIds: string[],
    task: { id: string; title: string; boardId?: string | null; workspaceId?: string | null },
  ): Promise<NotificationModel[]> {
    const uniqueUserIds = [...new Set(userIds)];

    const results = await Promise.all(
      uniqueUserIds.map((userId) =>
        this.createForUser(userId, 'comment_mention', {
          taskId: task.id,
          taskTitle: task.title,
          boardId: task.boardId,
          workspaceId: task.workspaceId,
        }),
      ),
    );

    return results;
  }
}
