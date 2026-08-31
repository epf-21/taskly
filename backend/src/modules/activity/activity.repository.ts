import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import type { ActivityAction } from 'src/generated/prisma/enums';
import type { ActivityLogModel } from 'src/generated/prisma/models';

export type ActivityLogInput = {
  workspaceId: string;
  boardId?: string | null;
  taskId?: string | null;
  userId?: string | null;
  action: ActivityAction;
  metadata?: Record<string, unknown>;
};

@Injectable()
export class ActivityRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: ActivityLogInput): Promise<ActivityLogModel> {
    return this.prisma.activityLog.create({
      data: {
        workspaceId: data.workspaceId,
        boardId: data.boardId ?? null,
        taskId: data.taskId ?? null,
        userId: data.userId ?? null,
        action: data.action,
        metadata: (data.metadata ?? {}) as any,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        board: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  findByWorkspace(
    workspaceId: string,
    limit = 25,
    action?: ActivityAction,
  ): Promise<ActivityLogModel[]> {
    return this.prisma.activityLog.findMany({
      where: {
        workspaceId,
        ...(action ? { action } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 100),
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
        board: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    });
  }

  findByBoard(
    boardId: string,
    limit = 25,
    action?: ActivityAction,
  ): Promise<ActivityLogModel[]> {
    return this.prisma.activityLog.findMany({
      where: {
        boardId,
        ...(action ? { action } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 100),
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
        board: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    });
  }

  findByTask(
    taskId: string,
    limit = 25,
    action?: ActivityAction,
  ): Promise<ActivityLogModel[]> {
    return this.prisma.activityLog.findMany({
      where: {
        taskId,
        ...(action ? { action } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 100),
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
        board: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    });
  }
}
