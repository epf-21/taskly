import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AttachmentsRepository } from 'src/modules/tasks/attachments/attachments.repository';
import { AttachmentsService } from 'src/modules/tasks/attachments/attachments.service';

describe('AttachmentsService', () => {
  let service: AttachmentsService;
  const repository = {
    findTaskById: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttachmentsService,
        { provide: AttachmentsRepository, useValue: repository },
      ],
    }).compile();
    service = module.get(AttachmentsService);
    jest.clearAllMocks();
  });

  it('registra metadata del adjunto y convierte el tamaño a bigint', async () => {
    repository.findTaskById.mockResolvedValue({ id: 'task-1' });
    repository.create.mockResolvedValue({ id: 'attachment-1' });

    await service.create('user-1', 'task-1', {
      fileName: 'spec.pdf',
      fileUrl: 'https://files.example/spec.pdf',
      fileSizeBytes: 1024,
      mimeType: 'application/pdf',
    });

    expect(repository.create).toHaveBeenCalledWith({
      taskId: 'task-1',
      uploadedBy: 'user-1',
      fileName: 'spec.pdf',
      fileUrl: 'https://files.example/spec.pdf',
      fileSizeBytes: BigInt(1024),
      mimeType: 'application/pdf',
    });
  });

  it('rechaza adjuntos para tareas inexistentes', async () => {
    repository.findTaskById.mockResolvedValue(null);

    await expect(
      service.create('user-1', 'missing', {
        fileName: 'spec.pdf',
        fileUrl: 'https://files.example/spec.pdf',
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
