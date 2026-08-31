import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ActivityAction } from 'src/generated/prisma/enums';
import type { TaskModel } from 'src/generated/prisma/models';
import { calculatePosition } from 'src/shared/utils/fractional-index.util';
import { ActivityService } from '../activity/activity.service';
import { ColumnsRepository } from '../columns/columns.repository';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateAssigneeDto } from './dto/create-assignee.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateTaskLabelDto } from './dto/create-task-label.dto';
import { FilterTasksDto } from './dto/filter-tasks.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksRepository, TaskDetail } from './tasks.repository';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly columnsRepository: ColumnsRepository,
    private readonly activityService: ActivityService,
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  async create(
    userId: string,
    columnId: string,
    dto: CreateTaskDto,
  ): Promise<TaskModel> {
    const column = await this.findColumn(columnId);
    const lastPosition = await this.tasksRepository.findLastPosition(column.id);
    const position = calculatePosition(lastPosition);

    const task = await this.tasksRepository.create({
      columnId: column.id,
      boardId: column.boardId,
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      createdBy: userId,
      position,
    });

    const workspaceId = await this.getWorkspaceIdForBoard(column.boardId);
    await this.activityService.log({
      workspaceId,
      boardId: column.boardId,
      taskId: task.id,
      userId,
      action: ActivityAction.task_created,
      metadata: { title: task.title, priority: task.priority },
    });

    if (task.dueDate) {
      await this.notifyAboutDueSoon(task, [userId]);
    }

    return task;
  }

  findManyByBoard(
    boardId: string,
    filters: FilterTasksDto,
  ): Promise<TaskModel[]> {
    return this.tasksRepository.findManyByBoard(boardId, filters);
  }

  async findDetail(taskId: string): Promise<TaskDetail> {
    const task = await this.tasksRepository.findDetailById(taskId);

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    return task;
  }

  async update(taskId: string, dto: UpdateTaskDto): Promise<TaskModel> {
    const task = await this.findExisting(taskId);
    const workspaceId = await this.getWorkspaceIdForBoard(task.boardId);

    const updatedTask = await this.tasksRepository.update(task.id, {
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      dueDate:
        dto.dueDate === undefined
          ? undefined
          : dto.dueDate
            ? new Date(dto.dueDate)
            : null,
    });

    await this.activityService.log({
      workspaceId,
      boardId: task.boardId,
      taskId: task.id,
      userId: undefined,
      action: ActivityAction.task_updated,
      metadata: { title: updatedTask.title, changedFields: Object.keys(dto) },
    });

    if (updatedTask.dueDate) {
      const assignees = await this.tasksRepository.findAssigneeIds(task.id);
      await this.notifyAboutDueSoon(updatedTask, assignees);
    }

    return updatedTask;
  }

  async move(taskId: string, dto: MoveTaskDto): Promise<TaskModel> {
    if (!dto.columnId && !dto.beforeId && !dto.afterId) {
      throw new BadRequestException(
        'Debe indicar columnId, beforeId o afterId',
      );
    }

    if (dto.beforeId && dto.beforeId === dto.afterId) {
      throw new BadRequestException('beforeId y afterId no pueden ser iguales');
    }

    if (
      taskId === dto.beforeId ||
      taskId === dto.afterId ||
      taskId === dto.columnId
    ) {
      throw new BadRequestException('Referencias inválidas en el movimiento');
    }

    const task = await this.findExisting(taskId);

    let targetColumnId = task.columnId;

    if (dto.columnId && dto.columnId !== task.columnId) {
      const targetColumn = await this.columnsRepository.findById(dto.columnId);

      if (!targetColumn) {
        throw new NotFoundException('Columna destino no encontrada');
      }

      if (targetColumn.boardId !== task.boardId) {
        throw new BadRequestException(
          'No se puede mover una tarea a otro board',
        );
      }

      targetColumnId = targetColumn.id;
    }

    const [before, after] = await Promise.all([
      dto.beforeId
        ? this.findNeighborInColumn(dto.beforeId, targetColumnId)
        : null,
      dto.afterId
        ? this.findNeighborInColumn(dto.afterId, targetColumnId)
        : null,
    ]);

    const position = calculatePosition(before?.position, after?.position);

    const movedTask = await this.tasksRepository.update(task.id, {
      columnId: targetColumnId,
      position,
    });

    const workspaceId = await this.getWorkspaceIdForBoard(task.boardId);
    await this.activityService.log({
      workspaceId,
      boardId: task.boardId,
      taskId: task.id,
      userId: undefined,
      action: ActivityAction.task_moved,
      metadata: { fromColumnId: task.columnId, toColumnId: targetColumnId },
    });

    return movedTask;
  }

  async archive(taskId: string): Promise<void> {
    const task = await this.findExisting(taskId);

    await this.tasksRepository.update(task.id, { isArchived: true });

    const workspaceId = await this.getWorkspaceIdForBoard(task.boardId);
    await this.activityService.log({
      workspaceId,
      boardId: task.boardId,
      taskId: task.id,
      userId: undefined,
      action: ActivityAction.task_archived,
      metadata: { title: task.title },
    });
  }

  async addAssignee(taskId: string, dto: CreateAssigneeDto): Promise<void> {
    const task = await this.findExisting(taskId);

    const isMember = await this.tasksRepository.isWorkspaceMember(
      task.boardId,
      dto.userId,
    );

    if (!isMember) {
      throw new BadRequestException(
        'El usuario no es miembro del workspace del board',
      );
    }

    const existing = await this.tasksRepository.findAssignee(
      task.id,
      dto.userId,
    );

    if (existing) {
      throw new ConflictException('El usuario ya está asignado a la tarea');
    }

    await this.tasksRepository.addAssignee(task.id, dto.userId);

    const workspaceId = await this.getWorkspaceIdForBoard(task.boardId);
    await this.activityService.log({
      workspaceId,
      boardId: task.boardId,
      taskId: task.id,
      userId: dto.userId,
      action: ActivityAction.task_assigned,
      metadata: { assignedUserId: dto.userId, title: task.title },
    });

    await this.notificationsService.createAssignedNotification(dto.userId, {
      id: task.id,
      title: task.title,
      boardId: task.boardId,
      workspaceId,
    });
  }

  async removeAssignee(taskId: string, assigneeId: string): Promise<void> {
    const task = await this.findExisting(taskId);

    const existing = await this.tasksRepository.findAssignee(
      taskId,
      assigneeId,
    );

    if (!existing) {
      throw new NotFoundException('El usuario no está asignado a la tarea');
    }

    await this.tasksRepository.removeAssignee(taskId, assigneeId);

    const workspaceId = await this.getWorkspaceIdForBoard(task.boardId);
    await this.activityService.log({
      workspaceId,
      boardId: task.boardId,
      taskId: task.id,
      userId: assigneeId,
      action: ActivityAction.task_unassigned,
      metadata: { unassignedUserId: assigneeId, title: task.title },
    });
  }

  async addLabel(taskId: string, dto: CreateTaskLabelDto): Promise<void> {
    const task = await this.findExisting(taskId);

    const label = await this.tasksRepository.findLabelForBoard(
      dto.labelId,
      task.boardId,
    );

    if (!label) {
      throw new NotFoundException(
        'Etiqueta no encontrada en el workspace del board',
      );
    }

    const existing = await this.tasksRepository.findTaskLabel(
      task.id,
      label.id,
    );

    if (existing) {
      throw new ConflictException('La etiqueta ya está aplicada a la tarea');
    }

    await this.tasksRepository.addTaskLabel(task.id, label.id);

    const workspaceId = await this.getWorkspaceIdForBoard(task.boardId);
    await this.activityService.log({
      workspaceId,
      boardId: task.boardId,
      taskId: task.id,
      userId: undefined,
      action: ActivityAction.label_created,
      metadata: { labelId: label.id, labelName: label.name, taskId: task.id },
    });
  }

  async removeLabel(taskId: string, labelId: string): Promise<void> {
    const task = await this.findExisting(taskId);

    const existing = await this.tasksRepository.findTaskLabel(taskId, labelId);

    if (!existing) {
      throw new NotFoundException('La etiqueta no está aplicada a la tarea');
    }

    await this.tasksRepository.removeTaskLabel(taskId, labelId);

    const workspaceId = await this.getWorkspaceIdForBoard(task.boardId);
    await this.activityService.log({
      workspaceId,
      boardId: task.boardId,
      taskId: task.id,
      userId: undefined,
      action: ActivityAction.label_deleted,
      metadata: { labelId, taskId: task.id },
    });
  }

  private async notifyAboutDueSoon(
    task: Pick<TaskModel, 'id' | 'title' | 'dueDate' | 'boardId'>,
    userIds: string[],
  ): Promise<void> {
    if (!task.dueDate) {
      return;
    }

    const workspaceId = await this.getWorkspaceIdForBoard(task.boardId);
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const diffHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours <= 24 && diffHours >= 0) {
      await Promise.all(
        userIds.map((userId) =>
          this.notificationsService.createDueSoonNotification(userId, {
            id: task.id,
            title: task.title,
            dueDate,
            boardId: task.boardId,
            workspaceId,
          }),
        ),
      );
    }
  }

  private async getWorkspaceIdForBoard(boardId: string): Promise<string> {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      select: { workspaceId: true },
    });

    if (!board) {
      throw new NotFoundException('Board no encontrado');
    }

    return board.workspaceId;
  }

  private async findExisting(taskId: string): Promise<TaskModel> {
    const task = await this.tasksRepository.findById(taskId);

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    return task;
  }

  private async findColumn(columnId: string) {
    const column = await this.columnsRepository.findById(columnId);

    if (!column) {
      throw new NotFoundException('Columna no encontrada');
    }

    return column;
  }

  private async findNeighborInColumn(
    neighborId: string,
    columnId: string,
  ): Promise<TaskModel> {
    const neighbor = await this.tasksRepository.findById(neighborId);

    if (!neighbor || neighbor.columnId !== columnId || neighbor.isArchived) {
      throw new BadRequestException(
        'El vecino indicado no pertenece a la columna destino',
      );
    }

    return neighbor;
  }
}
