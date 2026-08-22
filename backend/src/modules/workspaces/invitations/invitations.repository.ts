import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import type { WorkspaceRole } from 'src/generated/prisma/enums';

@Injectable()
export class InvitationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    workspaceId: string;
    invitedEmail: string;
    invitedBy: string;
    role: WorkspaceRole;
    token: string;
    expiresAt: Date;
  }) {
    return this.prisma.workspaceInvitation.create({ data });
  }

  findByToken(token: string) {
    return this.prisma.workspaceInvitation.findUnique({ where: { token } });
  }

  findPendingByEmail(workspaceId: string, invitedEmail: string) {
    return this.prisma.workspaceInvitation.findFirst({
      where: {
        workspaceId,
        invitedEmail,
        status: 'pending',
      },
    });
  }

  markAccepted(id: string) {
    return this.prisma.workspaceInvitation.update({
      where: { id },
      data: { status: 'accepted' },
    });
  }

  findMembershipByEmail(workspaceId: string, email: string) {
    return this.prisma.workspaceMember.findFirst({
      where: { workspaceId, user: { email } },
    });
  }

  async createMembershipAndAccept(data: {
    workspaceId: string;
    userId: string;
    role: WorkspaceRole;
    invitationId: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const membership = await tx.workspaceMember.create({
        data: {
          workspaceId: data.workspaceId,
          userId: data.userId,
          role: data.role,
        },
      });

      await tx.workspaceInvitation.update({
        where: { id: data.invitationId },
        data: { status: 'accepted' },
      });

      return membership;
    });
  }
}
