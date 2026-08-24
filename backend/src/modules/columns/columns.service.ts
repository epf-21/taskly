import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ColumnModel } from 'src/generated/prisma/models';
import { calculatePosition } from 'src/shared/utils/fractional-index.util';
import { CreateColumnDto } from './dto/create-column.dto';
import { ReorderColumnDto } from './dto/reorder-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { ColumnsRepository } from './columns.repository';

@Injectable()
export class ColumnsService {
  constructor(private readonly columnsRepository: ColumnsRepository) {}

  async create(boardId: string, dto: CreateColumnDto): Promise<ColumnModel> {
    const lastPosition = await this.columnsRepository.findLastPosition(boardId);
    const position = calculatePosition(lastPosition);

    return this.columnsRepository.create({
      boardId,
      name: dto.name,
      position,
      wipLimit: dto.wipLimit,
    });
  }

  async update(columnId: string, dto: UpdateColumnDto): Promise<ColumnModel> {
    await this.findExisting(columnId);

    return this.columnsRepository.update(columnId, {
      name: dto.name,
      wipLimit: dto.wipLimit,
    });
  }

  async reorder(boardId: string, dto: ReorderColumnDto): Promise<ColumnModel> {
    if (!dto.beforeId && !dto.afterId) {
      throw new BadRequestException('Debe indicar beforeId o afterId');
    }

    if (dto.beforeId && dto.beforeId === dto.afterId) {
      throw new BadRequestException('beforeId y afterId no pueden ser iguales');
    }

    if (dto.columnId === dto.beforeId || dto.columnId === dto.afterId) {
      throw new BadRequestException(
        'La columna movida no puede ser su propio vecino',
      );
    }

    const column = await this.findExisting(dto.columnId);

    if (column.boardId !== boardId) {
      throw new NotFoundException('Columna no encontrada en este board');
    }

    const [before, after] = await Promise.all([
      dto.beforeId ? this.findNeighborInBoard(dto.beforeId, boardId) : null,
      dto.afterId ? this.findNeighborInBoard(dto.afterId, boardId) : null,
    ]);

    const position = calculatePosition(before?.position, after?.position);

    return this.columnsRepository.update(column.id, { position });
  }

  async remove(columnId: string): Promise<void> {
    await this.findExisting(columnId);

    await this.columnsRepository.delete(columnId);
  }

  private async findNeighborInBoard(
    columnId: string,
    boardId: string,
  ): Promise<ColumnModel> {
    const neighbor = await this.columnsRepository.findById(columnId);

    if (!neighbor || neighbor.boardId !== boardId) {
      throw new BadRequestException(
        'El vecino indicado no pertenece a este board',
      );
    }

    return neighbor;
  }

  private async findExisting(columnId: string): Promise<ColumnModel> {
    const column = await this.columnsRepository.findById(columnId);

    if (!column) {
      throw new NotFoundException('Columna no encontrada');
    }

    return column;
  }
}
