import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import type { NotificationType } from 'src/generated/prisma/enums';
import type { NotificationModel } from 'src/generated/prisma/models';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    userId: string;
    type: NotificationType;
    payload: Record<string, unknown>;
  }): Promise<NotificationModel> {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        payload: data.payload as any,
      },
    });
  }

  findByUser(userId: string): Promise<NotificationModel[]> {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string): Promise<NotificationModel | null> {
    return this.prisma.notification.findUnique({ where: { id } });
  }

  markRead(id: string, userId: string): Promise<NotificationModel> {
    return this.prisma.notification.update({
      where: { id, userId },
      data: { readAt: new Date() },
    });
  }

  markAllRead(userId: string): Promise<{ count: number }> {
    return this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }
}
