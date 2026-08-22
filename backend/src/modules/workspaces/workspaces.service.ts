import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { WorkspaceModel } from 'src/generated/prisma/models';
import type { WorkspaceRole } from 'src/generated/prisma/enums';
import { meetsWorkspaceRole } from 'src/shared/enums/workspace-role.enum';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspacesRepository } from './workspaces.repository';

export interface WorkspaceWithRole {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  role: WorkspaceRole;
  joinedAt: Date;
}

@Injectable()
export class WorkspacesService {
  constructor(private readonly workspacesRepository: WorkspacesRepository) {}

  async create(
    userId: string,
    dto: CreateWorkspaceDto,
  ): Promise<WorkspaceModel> {
    const slug = await this.generateUniqueSlug(dto.name);

    return this.workspacesRepository.createWithOwner({
      name: dto.name,
      slug,
      description: dto.description,
      ownerId: userId,
    });
  }

  async findAllForUser(userId: string): Promise<WorkspaceWithRole[]> {
    const memberships =
      await this.workspacesRepository.findMembershipsOfUser(userId);

    return memberships.map((membership) => ({
      id: membership.workspace.id,
      name: membership.workspace.name,
      slug: membership.workspace.slug,
      description: membership.workspace.description,
      role: membership.role,
      joinedAt: membership.joinedAt,
    }));
  }

  async findOne(id: string): Promise<WorkspaceModel> {
    const workspace = await this.workspacesRepository.findById(id);

    if (!workspace) {
      throw new NotFoundException('Workspace no encontrado');
    }

    return workspace;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateWorkspaceDto,
  ): Promise<WorkspaceModel> {
    await this.findOne(id);
    await this.assertMinRole(userId, id, 'admin');

    return this.workspacesRepository.update(id, {
      name: dto.name,
      description: dto.description,
    });
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOne(id);
    await this.assertMinRole(userId, id, 'owner');

    await this.workspacesRepository.delete(id);
  }

  async assertMinRole(
    userId: string,
    workspaceId: string,
    required: WorkspaceRole,
  ): Promise<void> {
    const membership = await this.workspacesRepository.findMembership(
      workspaceId,
      userId,
    );

    if (!membership) {
      throw new ForbiddenException('No tienes acceso a este workspace');
    }

    if (!meetsWorkspaceRole(membership.role, required)) {
      throw new ForbiddenException(
        'No tienes permisos suficientes para esta acción',
      );
    }
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = this.slugify(name);
    let slug = base;

    while (await this.workspacesRepository.findBySlug(slug)) {
      slug = `${base}-${crypto.randomBytes(3).toString('hex')}`;
    }

    return slug;
  }

  private slugify(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 200);
  }
}
