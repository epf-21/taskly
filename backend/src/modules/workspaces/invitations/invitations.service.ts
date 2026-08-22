import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import type { WorkspaceRole } from 'src/generated/prisma/enums';
import { WorkspacesRepository } from '../workspaces.repository';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { InvitationsRepository } from './invitations.repository';

const INVITATION_EXPIRATION_DAYS = 7;

export interface InvitationAcceptedResult {
  workspace: { id: string; name: string; slug: string };
  role: WorkspaceRole;
  alreadyMember: boolean;
}

@Injectable()
export class InvitationsService {
  constructor(
    private readonly invitationsRepository: InvitationsRepository,
    private readonly workspacesRepository: WorkspacesRepository,
  ) {}

  async create(
    workspaceId: string,
    invitedBy: string,
    dto: CreateInvitationDto,
  ) {
    const role = dto.role ?? 'member';

    if (role === 'owner') {
      throw new ConflictException(
        'No se puede invitar directamente con el rol owner',
      );
    }

    const existingMembership =
      await this.invitationsRepository.findMembershipByEmail(
        workspaceId,
        dto.email,
      );

    if (existingMembership) {
      throw new ConflictException('Este usuario ya es miembro del workspace');
    }

    const pendingInvitation =
      await this.invitationsRepository.findPendingByEmail(
        workspaceId,
        dto.email,
      );

    if (pendingInvitation) {
      throw new ConflictException(
        'Ya existe una invitación pendiente para este email',
      );
    }

    return this.invitationsRepository.create({
      workspaceId,
      invitedEmail: dto.email,
      invitedBy,
      role,
      token: crypto.randomBytes(32).toString('hex'),
      expiresAt: new Date(
        Date.now() + INVITATION_EXPIRATION_DAYS * 24 * 60 * 60 * 1000,
      ),
    });
  }

  async accept(
    userId: string,
    userEmail: string,
    dto: AcceptInvitationDto,
  ): Promise<InvitationAcceptedResult> {
    const invitation = await this.invitationsRepository.findByToken(dto.token);

    if (
      !invitation ||
      invitation.status !== 'pending' ||
      invitation.expiresAt < new Date()
    ) {
      throw new NotFoundException('Invitación inválida');
    }

    if (invitation.invitedEmail !== userEmail) {
      throw new ForbiddenException('Esta invitación fue enviada a otro email');
    }

    const workspace = await this.workspacesRepository.findById(
      invitation.workspaceId,
    );

    if (!workspace) {
      throw new NotFoundException('Workspace no encontrado');
    }

    const existingMembership =
      await this.invitationsRepository.findMembershipByEmail(
        workspace.id,
        invitation.invitedEmail,
      );

    if (existingMembership) {
      await this.invitationsRepository.markAccepted(invitation.id);

      return {
        workspace: {
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
        },
        role: existingMembership.role,
        alreadyMember: true,
      };
    }

    const membership =
      await this.invitationsRepository.createMembershipAndAccept({
        workspaceId: workspace.id,
        userId,
        role: invitation.role,
        invitationId: invitation.id,
      });

    return {
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
      },
      role: membership.role,
      alreadyMember: false,
    };
  }
}
