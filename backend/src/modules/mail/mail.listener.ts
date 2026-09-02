import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from 'src/database/prisma.service';
import {
  InvitationCreatedEvent,
  MAIL_EVENTS,
  NotificationCreatedEvent,
} from './mail.events';
import { MailService } from './mail.service';

@Injectable()
export class MailListener {
  private readonly logger = new Logger(MailListener.name);

  constructor(
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent(MAIL_EVENTS.invitationCreated)
  async handleInvitationCreated(event: InvitationCreatedEvent): Promise<void> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: event.workspaceId },
      select: { name: true },
    });

    if (!workspace) {
      this.logger.error(
        `No se pudo enviar la invitación ${event.invitationId}: workspace no encontrado`,
      );
      return;
    }

    try {
      await this.mailService.sendInvitation({
        invitedEmail: event.invitedEmail,
        workspaceName: workspace.name,
        role: event.role,
        invitationUrl: this.buildInvitationUrl(event.token),
        expiresAt: event.expiresAt,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Falló el envío de la invitación ${event.invitationId}: ${message}`,
      );
    }
  }

  @OnEvent(MAIL_EVENTS.notificationCreated)
  async handleNotificationCreated(
    event: NotificationCreatedEvent,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: event.userId },
      select: { email: true },
    });

    if (!user) {
      this.logger.error(
        `No se pudo enviar la notificación ${event.notificationId}: usuario no encontrado`,
      );
      return;
    }

    const taskId = this.readString(event.payload, 'taskId');
    const taskTitle = this.readString(event.payload, 'taskTitle');

    if (!taskId || !taskTitle) {
      this.logger.error(
        `No se pudo enviar la notificación ${event.notificationId}: payload de tarea inválido`,
      );
      return;
    }

    const taskData = {
      recipientEmail: user.email,
      taskId,
      taskTitle,
      boardId: this.readString(event.payload, 'boardId'),
    };

    try {
      if (event.type === 'task_assigned') {
        await this.mailService.sendTaskAssigned(taskData);
      } else if (event.type === 'comment_mention') {
        await this.mailService.sendCommentMention(taskData);
      } else if (event.type === 'task_due_soon') {
        await this.mailService.sendTaskDueSoon({
          ...taskData,
          dueDate: this.readString(event.payload, 'dueDate'),
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Falló el envío de la notificación ${event.notificationId}: ${message}`,
      );
    }
  }

  private readString(
    payload: Record<string, unknown>,
    key: string,
  ): string | null {
    const value = payload[key];
    return typeof value === 'string' ? value : null;
  }

  private buildInvitationUrl(token: string): string {
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';

    return `${frontendUrl.replace(/\/$/, '')}/invitations/accept?token=${encodeURIComponent(token)}`;
  }
}
