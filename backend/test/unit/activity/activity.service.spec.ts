import { Test, TestingModule } from '@nestjs/testing';
import { ActivityAction } from 'src/generated/prisma/enums';
import { ActivityRepository } from 'src/modules/activity/activity.repository';
import { ActivityService } from 'src/modules/activity/activity.service';

describe('ActivityService', () => {
  let service: ActivityService;

  const repository = {
    create: jest.fn(),
    findByWorkspace: jest.fn(),
    findByBoard: jest.fn(),
    findByTask: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityService,
        { provide: ActivityRepository, useValue: repository },
      ],
    }).compile();

    service = module.get(ActivityService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('registra una actividad con todos sus datos', async () => {
    const input = {
      workspaceId: 'workspace-1',
      boardId: 'board-1',
      taskId: 'task-1',
      userId: 'user-1',
      action: ActivityAction.task_created,
      metadata: { title: 'Nueva tarea' },
    };
    const activity = { id: 'activity-1', ...input };
    repository.create.mockResolvedValue(activity);

    await expect(service.log(input)).resolves.toBe(activity);
    expect(repository.create).toHaveBeenCalledWith(input);
  });

  it('consulta actividad por workspace con límite y acción opcional', async () => {
    repository.findByWorkspace.mockResolvedValue([]);

    await service.findByWorkspace(
      'workspace-1',
      50,
      ActivityAction.task_created,
    );

    expect(repository.findByWorkspace).toHaveBeenCalledWith(
      'workspace-1',
      50,
      ActivityAction.task_created,
    );
  });

  it('consulta actividad por board', async () => {
    repository.findByBoard.mockResolvedValue([]);

    await service.findByBoard('board-1', 20, ActivityAction.task_updated);

    expect(repository.findByBoard).toHaveBeenCalledWith(
      'board-1',
      20,
      ActivityAction.task_updated,
    );
  });

  it('consulta actividad por tarea usando el límite por defecto', async () => {
    repository.findByTask.mockResolvedValue([]);

    await service.findByTask('task-1');

    expect(repository.findByTask).toHaveBeenCalledWith('task-1', 25, undefined);
  });
});
