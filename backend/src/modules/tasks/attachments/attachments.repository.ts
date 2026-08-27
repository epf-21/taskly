import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import type { AttachmentModel, TaskModel } from 'src/generated/prisma/models';

@Injectable()
export class AttachmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findTaskById(taskId: string): Promise<TaskModel | null> {
    return this.prisma.task.findUnique({ where: { id: taskId } });
  }

  create(data: {
    taskId: string;
    uploadedBy: string;
    fileName: string;
    fileUrl: string;
    fileSizeBytes?: bigint;
    mimeType?: string;
  }): Promise<AttachmentModel> {
    return this.prisma.attachment.create({ data });
  }
}
