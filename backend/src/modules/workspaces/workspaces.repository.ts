import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import type { WorkspaceRole } from 'src/generated/prisma/enums';
import { WorkspaceModel } from 'src/generated/prisma/models';

@Injectable()
export class WorkspacesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createWithOwner(data: {
    name: string;
    slug: string;
    description?: string;
    ownerId: string;
  }): Promise<WorkspaceModel> {
    return this.prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({ data });

      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: data.ownerId,
          role: 'owner',
        },
      });

      return workspace;
    });
  }

  findById(id: string): Promise<WorkspaceModel | null> {
    return this.prisma.workspace.findUnique({ where: { id } });
  }

  findBySlug(slug: string): Promise<WorkspaceModel | null> {
    return this.prisma.workspace.findUnique({ where: { slug } });
  }

  update(
    id: string,
    data: { name?: string; description?: string },
  ): Promise<WorkspaceModel> {
    return this.prisma.workspace.update({ where: { id }, data });
  }

  delete(id: string): Promise<WorkspaceModel> {
    return this.prisma.workspace.delete({ where: { id } });
  }

  findMembership(
    workspaceId: string,
    userId: string,
  ): Promise<{ role: WorkspaceRole } | null> {
    return this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
      select: { role: true },
    });
  }

  findMembershipsOfUser(userId: string) {
    return this.prisma.workspaceMember.findMany({
      where: { userId },
      include: { workspace: true },
      orderBy: { joinedAt: 'asc' },
    });
  }
}
