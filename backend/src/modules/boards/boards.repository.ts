import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import type {
  BoardModel,
  ColumnModel,
  TaskModel,
} from 'src/generated/prisma/models';

export type BoardDetail = BoardModel & {
  columns: (ColumnModel & { tasks: TaskModel[] })[];
};

@Injectable()
export class BoardsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    workspaceId: string;
    name: string;
    description?: string;
    createdBy: string;
  }): Promise<BoardModel> {
    return this.prisma.board.create({ data });
  }

  findManyByWorkspace(
    workspaceId: string,
    includeArchived = false,
  ): Promise<BoardModel[]> {
    return this.prisma.board.findMany({
      where: { workspaceId, ...(includeArchived ? {} : { isArchived: false }) },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string): Promise<BoardModel | null> {
    return this.prisma.board.findUnique({ where: { id } });
  }

  findDetailById(boardId: string): Promise<BoardDetail | null> {
    return this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            tasks: {
              where: { isArchived: false },
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    });
  }

  update(
    id: string,
    data: { name?: string; description?: string; isArchived?: boolean },
  ): Promise<BoardModel> {
    return this.prisma.board.update({ where: { id }, data });
  }
}
