import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CommentsRepository } from 'src/modules/tasks/comments/comments.repository';
import { CommentsService } from 'src/modules/tasks/comments/comments.service';

describe('CommentsService', () => {
  let service: CommentsService;
  const repository = {
    findTaskById: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: CommentsRepository, useValue: repository },
      ],
    }).compile();
    service = module.get(CommentsService);
    jest.clearAllMocks();
  });

  it('crea un comentario para la tarea', async () => {
    repository.findTaskById.mockResolvedValue({ id: 'task-1' });
    repository.create.mockResolvedValue({ id: 'comment-1' });

    await service.create('user-1', 'task-1', { content: 'Comentario' });

    expect(repository.create).toHaveBeenCalledWith({
      taskId: 'task-1',
      userId: 'user-1',
      content: 'Comentario',
    });
  });

  it('rechaza crear comentarios en tareas inexistentes', async () => {
    repository.findTaskById.mockResolvedValue(null);

    await expect(
      service.create('user-1', 'missing', { content: 'Comentario' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('solo permite al autor editar y eliminar', async () => {
    repository.findById.mockResolvedValue({
      id: 'comment-1',
      userId: 'owner',
    });

    await expect(
      service.update('other', 'comment-1', { content: 'Editado' }),
    ).rejects.toThrow(ForbiddenException);
    await expect(service.remove('other', 'comment-1')).rejects.toThrow(
      ForbiddenException,
    );
    expect(repository.update).not.toHaveBeenCalled();
    expect(repository.delete).not.toHaveBeenCalled();
  });
});
