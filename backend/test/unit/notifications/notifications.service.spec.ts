import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationType } from 'src/generated/prisma/enums';
import { NotificationsRepository } from 'src/modules/notifications/notifications.repository';
import { NotificationsService } from 'src/modules/notifications/notifications.service';

const notification = (overrides: Record<string, unknown> = {}) => ({
  id: 'notification-1',
  userId: 'user-1',
  type: NotificationType.task_assigned,
  payload: {},
  readAt: null,
  createdAt: new Date(),
  ...overrides,
});

describe('NotificationsService', () => {
  let service: NotificationsService;

  const repository = {
    create: jest.fn(),
    findByUser: jest.fn(),
    findById: jest.fn(),
    markRead: jest.fn(),
    markAllRead: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: NotificationsRepository, useValue: repository },
      ],
    }).compile();

    service = module.get(NotificationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('lista las notificaciones del usuario', async () => {
    const notifications = [notification()];
    repository.findByUser.mockResolvedValue(notifications);

    await expect(service.findByUser('user-1')).resolves.toBe(notifications);
    expect(repository.findByUser).toHaveBeenCalledWith('user-1');
  });

  it('crea una notificación con el tipo enum y payload', async () => {
    const created = notification({
      type: NotificationType.comment_mention,
      payload: { taskId: 'task-1' },
    });
    repository.create.mockResolvedValue(created);

    await service.createForUser('user-1', 'comment_mention', {
      taskId: 'task-1',
    });

    expect(repository.create).toHaveBeenCalledWith({
      userId: 'user-1',
      type: NotificationType.comment_mention,
      payload: { taskId: 'task-1' },
    });
  });

  it('crea una notificación de tarea asignada', async () => {
    repository.create.mockResolvedValue(notification());

    await service.createAssignedNotification('user-2', {
      id: 'task-1',
      title: 'Corregir bug',
      boardId: 'board-1',
      workspaceId: 'workspace-1',
    });

    expect(repository.create).toHaveBeenCalledWith({
      userId: 'user-2',
      type: NotificationType.task_assigned,
      payload: {
        taskId: 'task-1',
        taskTitle: 'Corregir bug',
        boardId: 'board-1',
        workspaceId: 'workspace-1',
      },
    });
  });

  it('crea una notificación de vencimiento próximo', async () => {
    const dueDate = new Date('2026-09-02T12:00:00.000Z');
    repository.create.mockResolvedValue(notification());

    await service.createDueSoonNotification('user-2', {
      id: 'task-1',
      title: 'Preparar release',
      dueDate,
      boardId: 'board-1',
      workspaceId: 'workspace-1',
    });

    expect(repository.create).toHaveBeenCalledWith({
      userId: 'user-2',
      type: NotificationType.task_due_soon,
      payload: {
        taskId: 'task-1',
        taskTitle: 'Preparar release',
        dueDate,
        boardId: 'board-1',
        workspaceId: 'workspace-1',
      },
    });
  });

  it('deduplica usuarios al crear notificaciones de menciones', async () => {
    repository.create
      .mockResolvedValueOnce(notification({ userId: 'user-2' }))
      .mockResolvedValueOnce(notification({ userId: 'user-3' }));

    const result = await service.createMentionNotifications(
      ['user-2', 'user-2', 'user-3'],
      {
        id: 'task-1',
        title: 'Revisar comentario',
        boardId: 'board-1',
        workspaceId: 'workspace-1',
      },
    );

    expect(repository.create).toHaveBeenCalledTimes(2);
    expect(repository.create).toHaveBeenNthCalledWith(1, {
      userId: 'user-2',
      type: NotificationType.comment_mention,
      payload: {
        taskId: 'task-1',
        taskTitle: 'Revisar comentario',
        boardId: 'board-1',
        workspaceId: 'workspace-1',
      },
    });
    expect(result).toHaveLength(2);
  });

  it('marca una notificación propia como leída', async () => {
    const current = notification();
    const read = notification({ readAt: new Date() });
    repository.findById.mockResolvedValue(current);
    repository.markRead.mockResolvedValue(read);

    await expect(service.markAsRead('user-1', current.id)).resolves.toBe(read);
    expect(repository.markRead).toHaveBeenCalledWith(current.id, 'user-1');
  });

  it('rechaza marcar como leída una notificación de otro usuario', async () => {
    repository.findById.mockResolvedValue(notification({ userId: 'user-2' }));

    await expect(
      service.markAsRead('user-1', 'notification-1'),
    ).rejects.toThrow(NotFoundException);
    expect(repository.markRead).not.toHaveBeenCalled();
  });

  it('marca todas las notificaciones pendientes como leídas', async () => {
    repository.markAllRead.mockResolvedValue({ count: 3 });

    await expect(service.markAllAsRead('user-1')).resolves.toEqual({
      count: 3,
    });
    expect(repository.markAllRead).toHaveBeenCalledWith('user-1');
  });
});
