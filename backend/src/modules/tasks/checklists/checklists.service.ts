import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  ChecklistItemModel,
  ChecklistModel,
} from 'src/generated/prisma/models';
import { calculatePosition } from 'src/shared/utils/fractional-index.util';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { ChecklistsRepository } from './checklists.repository';

@Injectable()
export class ChecklistsService {
  constructor(private readonly checklistsRepository: ChecklistsRepository) {}

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

    return this.checklistsRepository.create({
      taskId: task.id,
      title: dto.title,
      position: calculatePosition(lastPosition),
    });
  }

  async addItem(
    checklistId: string,
    dto: CreateChecklistItemDto,
  ): Promise<ChecklistItemModel> {
    const checklist = await this.findChecklist(checklistId);
    const lastPosition = await this.checklistsRepository.findLastItemPosition(
      checklist.id,
    );

    return this.checklistsRepository.createItem({
      checklistId: checklist.id,
      content: dto.content,
      position: calculatePosition(lastPosition),
    });
  }

  async toggleItem(itemId: string): Promise<ChecklistItemModel> {
    const item = await this.checklistsRepository.findItemById(itemId);

    if (!item) {
      throw new NotFoundException('Ítem de checklist no encontrado');
    }

    return this.checklistsRepository.toggleItem(item.id, !item.isDone);
  }

  private async findChecklist(checklistId: string): Promise<ChecklistModel> {
    const checklist = await this.checklistsRepository.findById(checklistId);

    if (!checklist) {
      throw new NotFoundException('Checklist no encontrado');
    }

    return checklist;
  }
}
