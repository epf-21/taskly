import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/database/prisma.service';
import { ActivityService } from 'src/modules/activity/activity.service';
import { ColumnsRepository } from 'src/modules/columns/columns.repository';
import { NotificationsService } from 'src/modules/notifications/notifications.service';
import { CreateAssigneeDto } from 'src/modules/tasks/dto/create-assignee.dto';
import { CreateTaskDto } from 'src/modules/tasks/dto/create-task.dto';
import { MoveTaskDto } from 'src/modules/tasks/dto/move-task.dto';
import { TasksRepository } from 'src/modules/tasks/tasks.repository';
import { TasksService } from 'src/modules/tasks/tasks.service';

const mockTask = (overrides: Record<string, unknown> = {}) => ({
  id: 't-1',
  columnId: 'c-1',
  boardId: 'b-1',
  title: 'Tarea inicial',
  description: null,
  position: 1024,
  priority: 'medium',
  dueDate: null,
  isArchived: false,
  createdBy: 'u1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const mockColumn = (overrides: Record<string, unknown> = {}) => ({
  id: 'c-1',
  boardId: 'b-1',
  name: 'Por hacer',
  position: 1024,
  wipLimit: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('TasksService', () => {
  let service: TasksService;

  const mockTasksRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findDetailById: jest.fn(),
    findManyByBoard: jest.fn(),
    update: jest.fn(),
    findLastPosition: jest.fn(),
    findAssignee: jest.fn(),
    findAssigneeIds: jest.fn(),
    addAssignee: jest.fn(),
    removeAssignee: jest.fn(),
    findTaskLabel: jest.fn(),
    addTaskLabel: jest.fn(),
    removeTaskLabel: jest.fn(),
    isWorkspaceMember: jest.fn(),
    findLabelForBoard: jest.fn(),
  };

  const mockColumnsRepository = {
    findById: jest.fn(),
  };

  const mockActivityService = {
    log: jest.fn(),
  };

  const mockNotificationsService = {
    createAssignedNotification: jest.fn(),
    createDueSoonNotification: jest.fn(),
  };

  const mockPrismaService = {
    board: {
      findUnique: jest.fn().mockResolvedValue({ workspaceId: 'w-1' }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TasksRepository, useValue: mockTasksRepository },
        { provide: ColumnsRepository, useValue: mockColumnsRepository },
        { provide: ActivityService, useValue: mockActivityService },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    jest.resetAllMocks();
    mockPrismaService.board.findUnique.mockResolvedValue({ workspaceId: 'w-1' });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('crea la tarea al final de la columna', async () => {
      mockColumnsRepository.findById.mockResolvedValue(mockColumn());
      mockTasksRepository.findLastPosition.mockResolvedValue(2048);
      mockTasksRepository.create.mockResolvedValue(mockTask());

      const dto: CreateTaskDto = { title: 'Nueva tarea' };
      await service.create('u1', 'c-1', dto);

      expect(mockTasksRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          columnId: 'c-1',
          boardId: 'b-1',
          title: 'Nueva tarea',
          createdBy: 'u1',
          position: 2049,
        }),
      );
    });

    it('lanza NotFoundException si la columna no existe', async () => {
      mockColumnsRepository.findById.mockResolvedValue(null);

      await expect(
        service.create('u1', 'missing', { title: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findDetail / findManyByBoard', () => {
    it('lanza NotFoundException si la tarea no existe', async () => {
      mockTasksRepository.findDetailById.mockResolvedValue(null);

      await expect(service.findDetail('missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('delega el listado con filtros al repositorio', async () => {
      mockTasksRepository.findManyByBoard.mockResolvedValue([]);

      const filters = { priority: 'high' as const, search: 'bug' };
      await service.findManyByBoard('b-1', filters);

      expect(mockTasksRepository.findManyByBoard).toHaveBeenCalledWith(
        'b-1',
        filters,
      );
    });
  });

  describe('update', () => {
    it('convierte dueDate a Date y actualiza', async () => {
      mockTasksRepository.findById.mockResolvedValue(mockTask());
      mockTasksRepository.update.mockResolvedValue(mockTask());

      const dto = { title: 'Editada', dueDate: '2026-12-31T00:00:00.000Z' };
      await service.update('t-1', dto);

      expect(mockTasksRepository.update).toHaveBeenCalledWith('t-1', {
        title: 'Editada',
        description: undefined,
        priority: undefined,
        dueDate: new Date('2026-12-31T00:00:00.000Z'),
      });
    });

    it('lanza NotFoundException si la tarea no existe', async () => {
      mockTasksRepository.findById.mockResolvedValue(null);

      await expect(service.update('missing', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('move', () => {
    it('lanza BadRequestException si no se indica nada', async () => {
      const dto: MoveTaskDto = {};

      await expect(service.move('t-1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('mueve a otra columna del mismo board y la coloca al final', async () => {
      mockTasksRepository.findById
        .mockResolvedValueOnce(mockTask({ columnId: 'c-1' }))
        .mockResolvedValueOnce(mockTask({ columnId: 'c-1' }));
      mockColumnsRepository.findById.mockResolvedValue(
        mockColumn({ id: 'c-2' }),
      );
      mockTasksRepository.update.mockResolvedValue(
        mockTask({ columnId: 'c-2', position: 2049 }),
      );

      const dto: MoveTaskDto = { columnId: 'c-2' };
      await service.move('t-1', dto);

      expect(mockTasksRepository.update).toHaveBeenCalledWith('t-1', {
        columnId: 'c-2',
        position: 1024,
      });
    });

    it('rechaza mover a una columna de otro board', async () => {
      mockTasksRepository.findById.mockResolvedValue(
        mockTask({ columnId: 'c-1' }),
      );
      mockColumnsRepository.findById.mockResolvedValue(
        mockColumn({ id: 'c-x', boardId: 'otro-board' }),
      );

      const dto: MoveTaskDto = { columnId: 'c-x' };

      await expect(service.move('t-1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rechaza vecinos que no pertenecen a la columna destino', async () => {
      mockTasksRepository.findById
        .mockResolvedValueOnce(mockTask({ columnId: 'c-1' }))
        .mockResolvedValueOnce(
          mockTask({ id: 't-n', columnId: 'c-desconocida' }),
        );

      const dto: MoveTaskDto = { beforeId: 't-n' };

      await expect(service.move('t-1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('calcula el punto medio entre vecinos en la misma columna', async () => {
      mockTasksRepository.findById
        .mockResolvedValueOnce(mockTask())
        .mockResolvedValueOnce(mockTask({ id: 't-a', position: 1000 }))
        .mockResolvedValueOnce(mockTask({ id: 't-b', position: 2000 }));
      mockTasksRepository.update.mockResolvedValue(mockTask());

      const dto: MoveTaskDto = { beforeId: 't-a', afterId: 't-b' };
      await service.move('t-1', dto);

      expect(mockTasksRepository.update).toHaveBeenCalledWith('t-1', {
        columnId: 'c-1',
        position: 1500,
      });
    });
  });

  describe('archive', () => {
    it('archiva en lugar de eliminar', async () => {
      mockTasksRepository.findById.mockResolvedValue(mockTask());
      mockTasksRepository.update.mockResolvedValue(
        mockTask({ isArchived: true }),
      );

      await service.archive('t-1');

      expect(mockTasksRepository.update).toHaveBeenCalledWith('t-1', {
        isArchived: true,
      });
    });
  });

  describe('assignees', () => {
    it('rechaza asignar a un usuario que no es miembro del workspace', async () => {
      mockTasksRepository.findById.mockResolvedValue(mockTask());
      mockTasksRepository.isWorkspaceMember.mockResolvedValue(false);

      const dto: CreateAssigneeDto = { userId: 'forastero' };

      await expect(service.addAssignee('t-1', dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockTasksRepository.addAssignee).not.toHaveBeenCalled();
    });

    it('rechaza duplicados', async () => {
      mockTasksRepository.findById.mockResolvedValue(mockTask());
      mockTasksRepository.isWorkspaceMember.mockResolvedValue(true);
      mockTasksRepository.findAssignee.mockResolvedValue({
        taskId: 't-1',
        userId: 'u2',
      });

      const dto: CreateAssigneeDto = { userId: 'u2' };

      await expect(service.addAssignee('t-1', dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('asigna un miembro válido', async () => {
      mockTasksRepository.findById.mockResolvedValue(mockTask());
      mockTasksRepository.isWorkspaceMember.mockResolvedValue(true);
      mockTasksRepository.findAssignee.mockResolvedValue(null);

      const dto: CreateAssigneeDto = { userId: 'u2' };
      await service.addAssignee('t-1', dto);

      expect(mockTasksRepository.addAssignee).toHaveBeenCalledWith('t-1', 'u2');
    });

    it('desasigna con 404 si no estaba asignado', async () => {
      mockTasksRepository.findById.mockResolvedValue(mockTask());
      mockTasksRepository.findAssignee.mockResolvedValue(null);

      await expect(service.removeAssignee('t-1', 'u2')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('labels', () => {
    it('rechaza etiquetas de otro workspace', async () => {
      mockTasksRepository.findById.mockResolvedValue(mockTask());
      mockTasksRepository.findLabelForBoard.mockResolvedValue(null);

      await expect(service.addLabel('t-1', { labelId: 'l-x' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('rechaza duplicados', async () => {
      mockTasksRepository.findById.mockResolvedValue(mockTask());
      mockTasksRepository.findLabelForBoard.mockResolvedValue({ id: 'l-1' });
      mockTasksRepository.findTaskLabel.mockResolvedValue({
        taskId: 't-1',
        labelId: 'l-1',
      });

      await expect(service.addLabel('t-1', { labelId: 'l-1' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('aplica una etiqueta válida', async () => {
      mockTasksRepository.findById.mockResolvedValue(mockTask());
      mockTasksRepository.findLabelForBoard.mockResolvedValue({ id: 'l-1' });
      mockTasksRepository.findTaskLabel.mockResolvedValue(null);

      await service.addLabel('t-1', { labelId: 'l-1' });

      expect(mockTasksRepository.addTaskLabel).toHaveBeenCalledWith(
        't-1',
        'l-1',
      );
    });

    it('quita una etiqueta aplicada', async () => {
      mockTasksRepository.findById.mockResolvedValue(mockTask());
      mockTasksRepository.findTaskLabel.mockResolvedValue({
        taskId: 't-1',
        labelId: 'l-1',
      });

      await service.removeLabel('t-1', 'l-1');

      expect(mockTasksRepository.removeTaskLabel).toHaveBeenCalledWith(
        't-1',
        'l-1',
      );
    });
  });
});
