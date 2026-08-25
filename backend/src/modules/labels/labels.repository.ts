import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { LabelModel } from 'src/generated/prisma/models';

@Injectable()
export class LabelsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    workspaceId: string;
    name: string;
    color?: string;
  }): Promise<LabelModel> {
    return this.prisma.label.create({ data });
  }

  findManyByWorkspace(workspaceId: string): Promise<LabelModel[]> {
    return this.prisma.label.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
    });
  }

  findById(id: string): Promise<LabelModel | null> {
    return this.prisma.label.findUnique({ where: { id } });
  }

  findByName(workspaceId: string, name: string): Promise<LabelModel | null> {
    return this.prisma.label.findUnique({
      where: { workspaceId_name: { workspaceId, name } },
    });
  }

  update(
    id: string,
    data: { name?: string; color?: string },
  ): Promise<LabelModel> {
    return this.prisma.label.update({ where: { id }, data });
  }

  delete(id: string): Promise<LabelModel> {
    return this.prisma.label.delete({ where: { id } });
  }
}
