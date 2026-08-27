import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import type {
  ChecklistItemModel,
  ChecklistModel,
  TaskModel,
} from 'src/generated/prisma/models';

@Injectable()
export class ChecklistsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findTaskById(taskId: string): Promise<TaskModel | null> {
    return this.prisma.task.findUnique({ where: { id: taskId } });
  }

  findLastPosition(taskId: string): Promise<number | null> {
    return this.prisma.checklist
      .findFirst({
        where: { taskId },
        orderBy: { position: 'desc' },
        select: { position: true },
      })
      .then((checklist) => checklist?.position ?? null);
  }

  create(data: {
    taskId: string;
    title?: string;
    position: number;
  }): Promise<ChecklistModel> {
    return this.prisma.checklist.create({ data });
  }

  findById(id: string): Promise<ChecklistModel | null> {
    return this.prisma.checklist.findUnique({ where: { id } });
  }

  findLastItemPosition(checklistId: string): Promise<number | null> {
    return this.prisma.checklistItem
      .findFirst({
        where: { checklistId },
        orderBy: { position: 'desc' },
        select: { position: true },
      })
      .then((item) => item?.position ?? null);
  }

  createItem(data: {
    checklistId: string;
    content: string;
    position: number;
  }): Promise<ChecklistItemModel> {
    return this.prisma.checklistItem.create({ data });
  }

  findItemById(id: string): Promise<ChecklistItemModel | null> {
    return this.prisma.checklistItem.findUnique({ where: { id } });
  }

  toggleItem(id: string, isDone: boolean): Promise<ChecklistItemModel> {
    return this.prisma.checklistItem.update({
      where: { id },
      data: { isDone },
    });
  }
}
