import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/database/prisma.service';
import { ActivityService } from 'src/modules/activity/activity.service';
import { ChecklistsRepository } from 'src/modules/tasks/checklists/checklists.repository';
import { ChecklistsService } from 'src/modules/tasks/checklists/checklists.service';

describe('ChecklistsService', () => {
  let service: ChecklistsService;
  const repository = {
    findTaskById: jest.fn(),
    findLastPosition: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findLastItemPosition: jest.fn(),
    createItem: jest.fn(),
    findItemById: jest.fn(),
    toggleItem: jest.fn(),
  };

  const mockActivityService = { log: jest.fn() };
  const mockPrismaService = {
    task: {
      findUnique: jest.fn().mockResolvedValue({
        boardId: 'board-1',
        board: { workspaceId: 'ws-1' },
      }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChecklistsService,
        { provide: ChecklistsRepository, useValue: repository },
        { provide: ActivityService, useValue: mockActivityService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();
    service = module.get(ChecklistsService);
    jest.clearAllMocks();
    mockPrismaService.task.findUnique.mockResolvedValue({
      boardId: 'board-1',
      board: { workspaceId: 'ws-1' },
    });
  });

  it('crea una checklist al final de la tarea', async () => {
    repository.findTaskById.mockResolvedValue({ id: 'task-1' });
    repository.findLastPosition.mockResolvedValue(2048);
    repository.create.mockResolvedValue({ id: 'checklist-1' });

    await service.create('task-1', { title: 'QA' });

    expect(repository.create).toHaveBeenCalledWith({
      taskId: 'task-1',
      title: 'QA',
      position: 2049,
    });
  });

  it('agrega ítems y calcula su posición', async () => {
    repository.findById.mockResolvedValue({ id: 'checklist-1' });
    repository.findLastItemPosition.mockResolvedValue(1024);
    repository.createItem.mockResolvedValue({ id: 'item-1' });

    await service.addItem('checklist-1', { content: 'Verificar build' });

    expect(repository.createItem).toHaveBeenCalledWith({
      checklistId: 'checklist-1',
      content: 'Verificar build',
      position: 1025,
    });
  });

  it('invierte el estado de completado del ítem', async () => {
    repository.findItemById.mockResolvedValue({ id: 'item-1', isDone: false });
    repository.toggleItem.mockResolvedValue({ id: 'item-1', isDone: true });

    await service.toggleItem('item-1');

    expect(repository.toggleItem).toHaveBeenCalledWith('item-1', true);
  });

  it('rechaza ítems inexistentes', async () => {
    repository.findItemById.mockResolvedValue(null);

    await expect(service.toggleItem('missing')).rejects.toThrow(
      NotFoundException,
    );
  });
});
