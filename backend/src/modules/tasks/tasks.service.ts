import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { TaskModel } from 'src/generated/prisma/models';
import { calculatePosition } from 'src/shared/utils/fractional-index.util';
import { ColumnsRepository } from '../columns/columns.repository';
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
  ) {}

  async create(
    userId: string,
    columnId: string,
    dto: CreateTaskDto,
  ): Promise<TaskModel> {
    const column = await this.findColumn(columnId);
    const lastPosition = await this.tasksRepository.findLastPosition(column.id);
    const position = calculatePosition(lastPosition);

    return this.tasksRepository.create({
      columnId: column.id,
      boardId: column.boardId,
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      createdBy: userId,
      position,
    });
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

    return this.tasksRepository.update(task.id, {
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

    return this.tasksRepository.update(task.id, {
      columnId: targetColumnId,
      position,
    });
  }
  async archive(taskId: string): Promise<void> {
    const task = await this.findExisting(taskId);

    await this.tasksRepository.update(task.id, { isArchived: true });
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
  }

  async removeAssignee(taskId: string, assigneeId: string): Promise<void> {
    await this.findExisting(taskId);

    const existing = await this.tasksRepository.findAssignee(
      taskId,
      assigneeId,
    );

    if (!existing) {
      throw new NotFoundException('El usuario no está asignado a la tarea');
    }

    await this.tasksRepository.removeAssignee(taskId, assigneeId);
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
  }

  async removeLabel(taskId: string, labelId: string): Promise<void> {
    await this.findExisting(taskId);

    const existing = await this.tasksRepository.findTaskLabel(taskId, labelId);

    if (!existing) {
      throw new NotFoundException('La etiqueta no está aplicada a la tarea');
    }

    await this.tasksRepository.removeTaskLabel(taskId, labelId);
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
