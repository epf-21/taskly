import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
import { LabelsRepository } from './labels.repository';
import type { LabelModel } from 'src/generated/prisma/models';

@Injectable()
export class LabelsService {
  constructor(private readonly labelsRepository: LabelsRepository) {}

  async create(workspaceId: string, dto: CreateLabelDto): Promise<LabelModel> {
    const existing = await this.labelsRepository.findByName(
      workspaceId,
      dto.name,
    );

    if (existing) {
      throw new ConflictException(
        'Ya existe una etiqueta con ese nombre en el workspace',
      );
    }

    return this.labelsRepository.create({
      workspaceId,
      name: dto.name,
      color: dto.color,
    });
  }

  findAll(workspaceId: string): Promise<LabelModel[]> {
    return this.labelsRepository.findManyByWorkspace(workspaceId);
  }

  async update(
    workspaceId: string,
    labelId: string,
    dto: UpdateLabelDto,
  ): Promise<LabelModel> {
    const label = await this.findInWorkspace(workspaceId, labelId);

    if (dto.name && dto.name !== label.name) {
      const duplicate = await this.labelsRepository.findByName(
        workspaceId,
        dto.name,
      );

      if (duplicate) {
        throw new ConflictException(
          'Ya existe una etiqueta con ese nombre en el workspace',
        );
      }
    }

    return this.labelsRepository.update(label.id, dto);
  }

  async remove(workspaceId: string, labelId: string): Promise<void> {
    const label = await this.findInWorkspace(workspaceId, labelId);

    await this.labelsRepository.delete(label.id);
  }

  private async findInWorkspace(workspaceId: string, labelId: string) {
    const label = await this.labelsRepository.findById(labelId);

    if (!label || label.workspaceId !== workspaceId) {
      throw new NotFoundException('Etiqueta no encontrada');
    }

    return label;
  }
}
