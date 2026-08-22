import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/database/prisma.service';
import type { WorkspaceRole } from 'src/generated/prisma/enums';
import { meetsWorkspaceRole } from 'src/shared/enums/workspace-role.enum';
import { WORKSPACE_ROLE_KEY } from '../decorators/roles.decorator';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@Injectable()
export class WorkspaceRolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRole = this.reflector.getAllAndOverride<WorkspaceRole>(
      WORKSPACE_ROLE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRole) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest & { params: Record<string, string> }>();
    const userId = request.user?.id;
    const workspaceId = request.params.workspaceId ?? request.params.id;

    if (!userId || !workspaceId) {
      throw new ForbiddenException('Acceso denegado');
    }

    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId },
      },
      select: { role: true },
    });

    if (!membership) {
      throw new ForbiddenException('No tienes acceso a este workspace');
    }

    if (!meetsWorkspaceRole(membership.role, requiredRole)) {
      throw new ForbiddenException(
        'No tienes permisos suficientes para esta acción',
      );
    }

    return true;
  }
}
