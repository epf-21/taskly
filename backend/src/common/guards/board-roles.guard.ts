import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/database/prisma.service';
import type { BoardRole, WorkspaceRole } from 'src/generated/prisma/enums';
import { meetsBoardRole } from 'src/shared/enums/board-role.enum';
import { BOARD_ROLE_KEY } from '../decorators/roles.decorator';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

const WORKSPACE_ROLE_TO_BOARD: Record<WorkspaceRole, BoardRole | undefined> = {
  owner: 'admin',
  admin: 'admin',
  member: 'member',
  viewer: 'viewer',
};

@Injectable()
export class BoardRolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRole = this.reflector.getAllAndOverride<BoardRole>(
      BOARD_ROLE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRole) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest & { params: Record<string, string> }>();
    const userId = request.user?.id;

    let boardId = request.params.boardId ?? request.params.id;

    const columnId = request.params.columnId;
    if (!boardId && columnId) {
      const column = await this.prisma.column.findUnique({
        where: { id: columnId },
        select: { boardId: true },
      });

      if (!column) {
        throw new NotFoundException('Columna no encontrada');
      }

      boardId = column.boardId;
    }

    if (!userId || !boardId) {
      throw new ForbiddenException('Acceso denegado');
    }

    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      select: { id: true, workspaceId: true },
    });

    if (!board) {
      throw new NotFoundException('Board no encontrado');
    }

    const [membership, override] = await Promise.all([
      this.prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: { workspaceId: board.workspaceId, userId },
        },
        select: { role: true },
      }),
      this.prisma.boardMember.findUnique({
        where: { boardId_userId: { boardId: board.id, userId } },
        select: { role: true },
      }),
    ]);

    const inherited = membership && WORKSPACE_ROLE_TO_BOARD[membership.role];
    const effectiveRole = override?.role ?? inherited;

    if (!effectiveRole) {
      throw new ForbiddenException('No tienes acceso a este board');
    }

    if (!meetsBoardRole(effectiveRole, requiredRole)) {
      throw new ForbiddenException(
        'No tienes permisos suficientes para esta acción',
      );
    }

    return true;
  }
}
