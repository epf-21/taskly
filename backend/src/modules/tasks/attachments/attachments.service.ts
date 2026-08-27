import { Injectable, NotFoundException } from '@nestjs/common';
import type { AttachmentModel } from 'src/generated/prisma/models';
import { AttachmentsRepository } from './attachments.repository';
import { CreateAttachmentDto } from './dto/create-attachment.dto';

export type AttachmentResponse = Omit<AttachmentModel, 'fileSizeBytes'> & {
  fileSizeBytes: number | null;
};

@Injectable()
export class AttachmentsService {
  constructor(private readonly attachmentsRepository: AttachmentsRepository) {}

  async create(
    userId: string,
    taskId: string,
    dto: CreateAttachmentDto,
  ): Promise<AttachmentResponse> {
    const task = await this.attachmentsRepository.findTaskById(taskId);

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    const attachment = await this.attachmentsRepository.create({
      taskId: task.id,
      uploadedBy: userId,
      fileName: dto.fileName,
      fileUrl: dto.fileUrl,
      fileSizeBytes:
        dto.fileSizeBytes === undefined ? undefined : BigInt(dto.fileSizeBytes),
      mimeType: dto.mimeType,
    });

    return {
      ...attachment,
      fileSizeBytes:
        attachment.fileSizeBytes === null ||
        attachment.fileSizeBytes === undefined
          ? null
          : Number(attachment.fileSizeBytes),
    };
  }
}
