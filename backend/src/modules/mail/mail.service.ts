import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export type InvitationMailData = {
  invitedEmail: string;
  workspaceName: string;
  role: string;
  invitationUrl: string;
  expiresAt: Date;
};

export type TaskMailData = {
  recipientEmail: string;
  taskId: string;
  taskTitle: string;
  boardId?: string | null;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('mail.host');
    const port = this.configService.get<number>('mail.port');
    const user = this.configService.get<string>('mail.user');
    const password = this.configService.get<string>('mail.password');

    this.from =
      this.configService.get<string>('mail.from') ?? 'no-reply@taskly.local';

    this.transporter =
      host && port
        ? nodemailer.createTransport({
            host,
            port,
            secure:
              this.configService.get<boolean>('mail.secure') ?? port === 465,
            auth: user && password ? { user, pass: password } : undefined,
          })
        : null;
  }

  async sendInvitation(data: InvitationMailData): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(
        `Correo de invitación omitido: SMTP no configurado para ${data.invitedEmail}`,
      );
      return;
    }

    await this.transporter.sendMail({
      from: this.from,
      to: data.invitedEmail,
      subject: `Invitación para unirte a ${data.workspaceName} en Taskly`,
      text: [
        `Has sido invitado a unirte al workspace "${data.workspaceName}" en Taskly.`,
        `Rol: ${data.role}.`,
        `Acepta la invitación aquí: ${data.invitationUrl}`,
        `La invitación expira el ${data.expiresAt.toISOString()}.`,
      ].join('\n'),
      html: `
        <h1>Invitación a ${data.workspaceName}</h1>
        <p>Has sido invitado a unirte a este workspace en Taskly.</p>
        <p><strong>Rol:</strong> ${data.role}</p>
        <p><a href="${data.invitationUrl}">Aceptar invitación</a></p>
        <p>La invitación expira el ${data.expiresAt.toISOString()}.</p>
      `,
    });
  }

  async sendTaskAssigned(data: TaskMailData): Promise<void> {
    await this.sendTaskNotification(
      data,
      `Te asignaron la tarea "${data.taskTitle}" en Taskly`,
      `Se te asignó la tarea "${data.taskTitle}".`,
    );
  }

  async sendCommentMention(data: TaskMailData): Promise<void> {
    await this.sendTaskNotification(
      data,
      `Te mencionaron en un comentario de "${data.taskTitle}"`,
      `Te mencionaron en un comentario de la tarea "${data.taskTitle}".`,
    );
  }

  async sendTaskDueSoon(
    data: TaskMailData & { dueDate?: string | null },
  ): Promise<void> {
    await this.sendTaskNotification(
      data,
      `La tarea "${data.taskTitle}" está próxima a vencer`,
      `La tarea "${data.taskTitle}" está próxima a vencer.`,
    );
  }

  private async sendTaskNotification(
    data: TaskMailData,
    subject: string,
    message: string,
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(
        `Correo omitido: SMTP no configurado para ${data.recipientEmail}`,
      );
      return;
    }

    await this.transporter.sendMail({
      from: this.from,
      to: data.recipientEmail,
      subject,
      text: `${message}\nTarea: ${data.taskId}`,
      html: `<p>${message}</p><p><strong>ID de tarea:</strong> ${data.taskId}</p>`,
    });
  }
}
