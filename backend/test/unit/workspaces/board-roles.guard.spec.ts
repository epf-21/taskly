import {
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { BoardRolesGuard } from 'src/common/guards/board-roles.guard';
import { PrismaService } from 'src/database/prisma.service';

function createMockContext(
  user: { id: string } | undefined,
  params: Record<string, string>,
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user, params }),
    }),
    getHandler: () => () => undefined,
    getClass: () => Object,
  } as unknown as ExecutionContext;
}

describe('BoardRolesGuard', () => {
  let guard: BoardRolesGuard;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const mockPrisma = {
    board: {
      findUnique: jest.fn(),
    },
    column: {
      findUnique: jest.fn(),
    },
    task: {
      findUnique: jest.fn(),
    },
    workspaceMember: {
      findUnique: jest.fn(),
    },
    boardMember: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardRolesGuard,
        { provide: Reflector, useValue: mockReflector },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    guard = module.get<BoardRolesGuard>(BoardRolesGuard);
    jest.clearAllMocks();
  });

  it('permite el acceso si la ruta no exige rol de board', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);

    const result = await guard.canActivate(createMockContext({ id: 'u1' }, {}));

    expect(result).toBe(true);
  });

  it('lanza NotFoundException si el board no existe', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('member');
    mockPrisma.board.findUnique.mockResolvedValue(null);

    await expect(
      guard.canActivate(createMockContext({ id: 'u1' }, { boardId: 'b-1' })),
    ).rejects.toThrow(new NotFoundException('Board no encontrado'));
  });

  it('lanza ForbiddenException si el usuario no es miembro del workspace ni del board', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('viewer');
    mockPrisma.board.findUnique.mockResolvedValue({
      id: 'b-1',
      workspaceId: 'ws-1',
    });
    mockPrisma.workspaceMember.findUnique.mockResolvedValue(null);
    mockPrisma.boardMember.findUnique.mockResolvedValue(null);

    await expect(
      guard.canActivate(createMockContext({ id: 'u1' }, { boardId: 'b-1' })),
    ).rejects.toThrow(ForbiddenException);
  });

  it('hereda el rol desde el workspace (member del workspace → member del board)', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('member');
    mockPrisma.board.findUnique.mockResolvedValue({
      id: 'b-1',
      workspaceId: 'ws-1',
    });
    mockPrisma.workspaceMember.findUnique.mockResolvedValue({ role: 'member' });
    mockPrisma.boardMember.findUnique.mockResolvedValue(null);

    const result = await guard.canActivate(
      createMockContext({ id: 'u1' }, { boardId: 'b-1' }),
    );

    expect(result).toBe(true);
  });

  it('da prioridad al override de rol a nivel board (viewer en workspace, admin en board)', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('admin');
    mockPrisma.board.findUnique.mockResolvedValue({
      id: 'b-1',
      workspaceId: 'ws-1',
    });
    mockPrisma.workspaceMember.findUnique.mockResolvedValue({ role: 'viewer' });
    mockPrisma.boardMember.findUnique.mockResolvedValue({ role: 'admin' });

    const result = await guard.canActivate(
      createMockContext({ id: 'u1' }, { boardId: 'b-1' }),
    );

    expect(result).toBe(true);
  });

  it('lanza ForbiddenException si el rol efectivo es insuficiente', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('admin');
    mockPrisma.board.findUnique.mockResolvedValue({
      id: 'b-1',
      workspaceId: 'ws-1',
    });
    mockPrisma.workspaceMember.findUnique.mockResolvedValue({ role: 'owner' });
    mockPrisma.boardMember.findUnique.mockResolvedValue({ role: 'viewer' });

    await expect(
      guard.canActivate(createMockContext({ id: 'u1' }, { boardId: 'b-1' })),
    ).rejects.toThrow(ForbiddenException);
  });

  it('resuelve el board desde columnId cuando la ruta es de columna', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('admin');
    mockPrisma.column.findUnique.mockResolvedValue({ boardId: 'b-1' });
    mockPrisma.board.findUnique.mockResolvedValue({
      id: 'b-1',
      workspaceId: 'ws-1',
    });
    mockPrisma.workspaceMember.findUnique.mockResolvedValue({ role: 'owner' });
    mockPrisma.boardMember.findUnique.mockResolvedValue(null);

    const result = await guard.canActivate(
      createMockContext({ id: 'u1' }, { columnId: 'c-1' }),
    );

    expect(mockPrisma.column.findUnique).toHaveBeenCalledWith({
      where: { id: 'c-1' },
      select: { boardId: true },
    });
    expect(result).toBe(true);
  });

  it('lanza NotFoundException si la columna no existe', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('member');
    mockPrisma.column.findUnique.mockResolvedValue(null);

    await expect(
      guard.canActivate(
        createMockContext({ id: 'u1' }, { columnId: 'missing' }),
      ),
    ).rejects.toThrow(new NotFoundException('Columna no encontrada'));
  });

  it('resuelve el board desde taskId cuando la ruta es de tarea', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('member');
    mockPrisma.task.findUnique.mockResolvedValue({ boardId: 'b-1' });
    mockPrisma.board.findUnique.mockResolvedValue({
      id: 'b-1',
      workspaceId: 'ws-1',
    });
    mockPrisma.workspaceMember.findUnique.mockResolvedValue({ role: 'member' });
    mockPrisma.boardMember.findUnique.mockResolvedValue(null);

    const result = await guard.canActivate(
      createMockContext({ id: 'u1' }, { taskId: 't-1' }),
    );

    expect(mockPrisma.task.findUnique).toHaveBeenCalledWith({
      where: { id: 't-1' },
      select: { boardId: true },
    });
    expect(result).toBe(true);
  });

  it('lanza NotFoundException si la tarea no existe', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('member');
    mockPrisma.task.findUnique.mockResolvedValue(null);

    await expect(
      guard.canActivate(createMockContext({ id: 'u1' }, { taskId: 'missing' })),
    ).rejects.toThrow(new NotFoundException('Tarea no encontrada'));
  });
});
