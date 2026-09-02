import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/database/prisma.service';
import { NotificationType } from 'src/generated/prisma/enums';
import { NotificationsService } from './notifications.service';

@Injectable()
export class TaskDueSoonScheduler {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleDueSoonNotifications(): Promise<void> {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const windowStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const tasks = await this.prisma.task.findMany({
      where: {
        isArchived: false,
        dueDate: {
          gte: now,
          lte: windowEnd,
        },
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        boardId: true,
        board: { select: { workspaceId: true } },
        assignees: { select: { userId: true } },
      },
    });

    for (const task of tasks) {
      const userIds = [
        ...new Set(task.assignees.map((assignee) => assignee.userId)),
      ];

      if (userIds.length === 0) {
        continue;
      }

      const existingNotifications = await this.prisma.notification.findMany({
        where: {
          userId: { in: userIds },
          type: NotificationType.task_due_soon,
          createdAt: { gte: windowStart },
        },
        select: { userId: true, payload: true },
      });

      const notifiedByUser = new Map<string, Set<string>>();

      for (const notification of existingNotifications) {
        const taskId = (notification.payload as Record<string, unknown>)
          ?.taskId;

        if (typeof taskId !== 'string') {
          continue;
        }

        const set =
          notifiedByUser.get(notification.userId) ?? new Set<string>();
        set.add(taskId);
        notifiedByUser.set(notification.userId, set);
      }

      for (const userId of userIds) {
        if (notifiedByUser.get(userId)?.has(task.id)) {
          continue;
        }

        await this.notificationsService.createDueSoonNotification(userId, {
          id: task.id,
          title: task.title,
          dueDate: task.dueDate,
          boardId: task.boardId,
          workspaceId: task.board.workspaceId,
        });
      }
    }
  }
}
