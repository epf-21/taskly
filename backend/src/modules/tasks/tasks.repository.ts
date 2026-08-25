import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import type { TaskPriority } from 'src/generated/prisma/enums';
import type {
  LabelModel,
  TaskAssigneeModel,
  TaskLabelModel,
  TaskModel,
  UserModel,
} from 'src/generated/prisma/models';

export interface TaskDetail extends TaskModel {
  assignees: (TaskAssigneeModel & { user: UserModel })[];
  labels: (TaskLabelModel & { label: LabelModel })[];
}

export interface TaskFilters {
  assigneeId?: string;
  labelId?: string;
  priority?: TaskPriority;
  search?: string;
  includeArchived?: boolean;
}

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    columnId: string;
    boardId: string;
    title: string;
    description?: string;
    priority?: TaskPriority;
    dueDate?: Date | null;
    createdBy: string;
    position: number;
  }): Promise<TaskModel> {
    return this.prisma.task.create({ data });
  }

  findById(id: string): Promise<TaskModel | null> {
    return this.prisma.task.findUnique({ where: { id } });
  }

  findDetailById(id: string): Promise<TaskDetail | null> {
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        assignees: { include: { user: true }, orderBy: { assignedAt: 'asc' } },
        labels: { include: { label: true } },
      },
    });
  }

  findManyByBoard(boardId: string, filters: TaskFilters): Promise<TaskModel[]> {
    const where = {
      boardId,
      ...(filters.includeArchived ? {} : { isArchived: false }),
      ...(filters.priority ? { priority: filters.priority } : {}),
      ...(filters.assigneeId
        ? { assignees: { some: { userId: filters.assigneeId } } }
        : {}),
      ...(filters.labelId
        ? { labels: { some: { labelId: filters.labelId } } }
        : {}),
      ...(filters.search
        ? {
            OR: [
              {
                title: {
                  contains: filters.search,
                  mode: 'insensitive' as const,
                },
              },
              {
                description: {
                  contains: filters.search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    return this.prisma.task.findMany({ where, orderBy: { position: 'asc' } });
  }

  update(
    id: string,
    data: {
      title?: string;
      description?: string;
      priority?: TaskPriority;
      dueDate?: Date | null;
      columnId?: string;
      position?: number;
      isArchived?: boolean;
    },
  ): Promise<TaskModel> {
    return this.prisma.task.update({ where: { id }, data });
  }

  findLastPosition(columnId: string): Promise<number | null> {
    return this.prisma.task
      .findFirst({
        where: { columnId, isArchived: false },
        orderBy: { position: 'desc' },
        select: { position: true },
      })
      .then((task) => task?.position ?? null);
  }

  findAssignee(
    taskId: string,
    userId: string,
  ): Promise<TaskAssigneeModel | null> {
    return this.prisma.taskAssignee.findUnique({
      where: { taskId_userId: { taskId, userId } },
    });
  }

  addAssignee(taskId: string, userId: string): Promise<TaskAssigneeModel> {
    return this.prisma.taskAssignee.create({ data: { taskId, userId } });
  }

  async removeAssignee(taskId: string, userId: string): Promise<void> {
    await this.prisma.taskAssignee.delete({
      where: { taskId_userId: { taskId, userId } },
    });
  }

  findTaskLabel(
    taskId: string,
    labelId: string,
  ): Promise<TaskLabelModel | null> {
    return this.prisma.taskLabel.findUnique({
      where: { taskId_labelId: { taskId, labelId } },
    });
  }

  addTaskLabel(taskId: string, labelId: string): Promise<TaskLabelModel> {
    return this.prisma.taskLabel.create({ data: { taskId, labelId } });
  }

  async removeTaskLabel(taskId: string, labelId: string): Promise<void> {
    await this.prisma.taskLabel.delete({
      where: { taskId_labelId: { taskId, labelId } },
    });
  }

  isWorkspaceMember(boardId: string, userId: string): Promise<boolean> {
    return this.prisma.workspaceMember
      .findFirst({
        where: { userId, workspace: { boards: { some: { id: boardId } } } },
        select: { id: true },
      })
      .then(Boolean);
  }

  findLabelForBoard(labelId: string, boardId: string) {
    return this.prisma.label.findFirst({
      where: { id: labelId, workspace: { boards: { some: { id: boardId } } } },
    });
  }
}
