import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import type { WorkspaceRole } from 'src/generated/prisma/enums';

export interface WorkspaceMemberWithUser {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: WorkspaceRole;
  joinedAt: Date;
}

@Injectable()
export class MembersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyByWorkspace(
    workspaceId: string,
  ): Promise<WorkspaceMemberWithUser[]> {
    const members = await this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: true },
      orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
    });

    return members.map((member) => ({
      id: member.id,
      userId: member.user.id,
      email: member.user.email,
      fullName: member.user.fullName,
      avatarUrl: member.user.avatarUrl,
      role: member.role,
      joinedAt: member.joinedAt,
    }));
  }

  findByWorkspaceAndUserId(workspaceId: string, userId: string) {
    return this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
  }

  updateRole(workspaceId: string, userId: string, role: WorkspaceRole) {
    return this.prisma.workspaceMember.update({
      where: { workspaceId_userId: { workspaceId, userId } },
      data: { role },
    });
  }

  async delete(workspaceId: string, userId: string): Promise<void> {
    await this.prisma.workspaceMember.delete({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
  }
}
