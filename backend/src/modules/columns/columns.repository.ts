import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ColumnModel } from 'src/generated/prisma/models';

@Injectable()
export class ColumnsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    boardId: string;
    name: string;
    position: number;
    wipLimit?: number;
  }): Promise<ColumnModel> {
    return this.prisma.column.create({ data });
  }

  findById(id: string): Promise<ColumnModel | null> {
    return this.prisma.column.findUnique({ where: { id } });
  }

  findLastPosition(boardId: string): Promise<number | null> {
    return this.prisma.column
      .findFirst({
        where: { boardId },
        orderBy: { position: 'desc' },
        select: { position: true },
      })
      .then((column) => column?.position ?? null);
  }

  update(
    id: string,
    data: { name?: string; wipLimit?: number | null; position?: number },
  ): Promise<ColumnModel> {
    return this.prisma.column.update({ where: { id }, data });
  }

  delete(id: string): Promise<ColumnModel> {
    return this.prisma.column.delete({ where: { id } });
  }
}
