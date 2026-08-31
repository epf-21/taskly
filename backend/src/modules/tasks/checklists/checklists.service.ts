import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ActivityAction } from 'src/generated/prisma/enums';
import type {
  ChecklistItemModel,
  ChecklistModel,
} from 'src/generated/prisma/models';
import { calculatePosition } from 'src/shared/utils/fractional-index.util';
import { ActivityService } from '../../activity/activity.service';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { ChecklistsRepository } from './checklists.repository';

@Injectable()
export class ChecklistsService {
  constructor(
    private readonly checklistsRepository: ChecklistsRepository,
    private readonly activityService: ActivityService,
    private readonly prisma: PrismaService,
  ) {}

  async create(
    taskId: string,
    dto: CreateChecklistDto,
  ): Promise<ChecklistModel> {
    const task = await this.checklistsRepository.findTaskById(taskId);

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    const lastPosition = await this.checklistsRepository.findLastPosition(
      task.id,
    );

    const checklist = await this.checklistsRepository.create({
      taskId: task.id,
      title: dto.title,
      position: calculatePosition(lastPosition),
    });

    const taskContext = await this.prisma.task.findUnique({
      where: { id: task.id },
      select: {
        boardId: true,
        board: { select: { workspaceId: true } },
      },
    });

    if (taskContext?.board) {
      await this.activityService.log({
        workspaceId: taskContext.board.workspaceId,
        boardId: task.boardId,
        taskId: task.id,
        action: ActivityAction.task_updated,
        metadata: { checklistId: checklist.id, title: dto.title },
      });
    }

    return checklist;
  }

  async addItem(
    checklistId: string,
    dto: CreateChecklistItemDto,
  ): Promise<ChecklistItemModel> {
    const checklist = await this.findChecklist(checklistId);
    const lastPosition = await this.checklistsRepository.findLastItemPosition(
      checklist.id,
    );

    const item = await this.checklistsRepository.createItem({
      checklistId: checklist.id,
      content: dto.content,
      position: calculatePosition(lastPosition),
    });

    const taskContext = await this.prisma.task.findUnique({
      where: { id: checklist.taskId },
      select: {
        boardId: true,
        board: { select: { workspaceId: true } },
      },
    });

    if (taskContext?.board) {
      await this.activityService.log({
        workspaceId: taskContext.board.workspaceId,
        boardId: taskContext.boardId,
        taskId: checklist.taskId,
        action: ActivityAction.task_updated,
        metadata: { checklistId: checklist.id, checklistItemId: item.id },
      });
    }

    return item;
  }

  async toggleItem(itemId: string): Promise<ChecklistItemModel> {
    const item = await this.checklistsRepository.findItemById(itemId);

    if (!item) {
      throw new NotFoundException('Ítem de checklist no encontrado');
    }

    const toggled = await this.checklistsRepository.toggleItem(
      item.id,
      !item.isDone,
    );

    const checklist = await this.checklistsRepository.findById(item.checklistId);

    if (checklist) {
      const taskContext = await this.prisma.task.findUnique({
        where: { id: checklist.taskId },
        select: {
          boardId: true,
          board: { select: { workspaceId: true } },
        },
      });

      if (taskContext?.board) {
        await this.activityService.log({
          workspaceId: taskContext.board.workspaceId,
          boardId: taskContext.boardId,
          taskId: checklist.taskId,
          action: ActivityAction.checklist_item_toggled,
          metadata: {
            checklistId: checklist.id,
            itemId: item.id,
            isDone: toggled.isDone,
          },
        });
      }
    }

    return toggled;
  }

  private async findChecklist(checklistId: string): Promise<ChecklistModel> {
    const checklist = await this.checklistsRepository.findById(checklistId);

    if (!checklist) {
      throw new NotFoundException('Checklist no encontrado');
    }

    return checklist;
  }
}
