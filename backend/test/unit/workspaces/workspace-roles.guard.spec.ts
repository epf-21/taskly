import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/database/prisma.service';
import { WorkspaceRolesGuard } from 'src/common/guards/workspace-roles.guard';

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

describe('WorkspaceRolesGuard', () => {
  let guard: WorkspaceRolesGuard;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const mockPrisma = {
    workspaceMember: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceRolesGuard,
        { provide: Reflector, useValue: mockReflector },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    guard = module.get<WorkspaceRolesGuard>(WorkspaceRolesGuard);
    jest.clearAllMocks();
  });

  it('permite el acceso si la ruta no exige rol de workspace', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);

    const result = await guard.canActivate(createMockContext({ id: 'u1' }, {}));

    expect(result).toBe(true);
    expect(mockPrisma.workspaceMember.findUnique).not.toHaveBeenCalled();
  });

  it('lanza ForbiddenException si no hay usuario autenticado', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('admin');

    await expect(
      guard.canActivate(createMockContext(undefined, { id: 'ws-1' })),
    ).rejects.toThrow(ForbiddenException);
  });

  it('lanza ForbiddenException si la ruta no tiene id de workspace', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('admin');

    await expect(
      guard.canActivate(createMockContext({ id: 'u1' }, {})),
    ).rejects.toThrow(ForbiddenException);
  });

  it('lanza ForbiddenException si el usuario no es miembro', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('viewer');
    mockPrisma.workspaceMember.findUnique.mockResolvedValue(null);

    await expect(
      guard.canActivate(
        createMockContext({ id: 'u1' }, { workspaceId: 'ws-1' }),
      ),
    ).rejects.toThrow(
      new ForbiddenException('No tienes acceso a este workspace'),
    );
  });

  it('lanza ForbiddenException si el rol es insuficiente (viewer < admin)', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('admin');
    mockPrisma.workspaceMember.findUnique.mockResolvedValue({ role: 'viewer' });

    await expect(
      guard.canActivate(createMockContext({ id: 'u1' }, { id: 'ws-1' })),
    ).rejects.toThrow(ForbiddenException);
  });

  it('permite el acceso si el rol cumple o supera el requerido (owner >= admin)', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('admin');
    mockPrisma.workspaceMember.findUnique.mockResolvedValue({ role: 'owner' });

    const result = await guard.canActivate(
      createMockContext({ id: 'u1' }, { id: 'ws-1' }),
    );

    expect(result).toBe(true);
    expect(mockPrisma.workspaceMember.findUnique).toHaveBeenCalledWith({
      where: { workspaceId_userId: { workspaceId: 'ws-1', userId: 'u1' } },
      select: { role: true },
    });
  });
});
