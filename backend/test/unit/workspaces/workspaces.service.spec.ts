import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateWorkspaceDto } from 'src/modules/workspaces/dto/create-workspace.dto';
import { UpdateWorkspaceDto } from 'src/modules/workspaces/dto/update-workspace.dto';
import { WorkspacesRepository } from 'src/modules/workspaces/workspaces.repository';
import { WorkspacesService } from 'src/modules/workspaces/workspaces.service';

const mockWorkspace = {
  id: 'ws-1',
  name: 'Mi Workspace',
  slug: 'mi-workspace',
  description: null,
  ownerId: 'u1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('WorkspacesService', () => {
  let service: WorkspacesService;

  const mockRepository = {
    createWithOwner: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMembership: jest.fn(),
    findMembershipsOfUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspacesService,
        { provide: WorkspacesRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<WorkspacesService>(WorkspacesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('crea el workspace con slug derivado del nombre y owner membership', async () => {
      mockRepository.findBySlug.mockResolvedValue(null);
      mockRepository.createWithOwner.mockResolvedValue(mockWorkspace);

      const dto: CreateWorkspaceDto = { name: 'Mi Workspace' };
      const result = await service.create('u1', dto);

      expect(mockRepository.createWithOwner).toHaveBeenCalledWith({
        name: 'Mi Workspace',
        slug: 'mi-workspace',
        description: undefined,
        ownerId: 'u1',
      });
      expect(result.id).toBe('ws-1');
    });

    it('normaliza el nombre (acentos, espacios y mayúsculas)', async () => {
      mockRepository.findBySlug.mockResolvedValue(null);
      mockRepository.createWithOwner.mockResolvedValue(mockWorkspace);

      await service.create('u1', { name: '  Diseño Ñandú 2026! ' });

      expect(mockRepository.createWithOwner).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'diseno-nandu-2026' }),
      );
    });

    it('agrega sufijo aleatorio si el slug ya existe', async () => {
      mockRepository.findBySlug
        .mockResolvedValueOnce(mockWorkspace)
        .mockResolvedValue(null);
      mockRepository.createWithOwner.mockResolvedValue(mockWorkspace);

      await service.create('u1', { name: 'Mi Workspace' });

      const [call] = mockRepository.createWithOwner.mock
        .calls[0] as unknown as [{ slug: string }];
      expect(call.slug).toMatch(/^mi-workspace-[a-f0-9]{6}$/);
    });
  });

  describe('findAllForUser', () => {
    it('mapea las membresías a workspaces con rol', async () => {
      mockRepository.findMembershipsOfUser.mockResolvedValue([
        {
          role: 'owner',
          joinedAt: new Date('2026-01-01'),
          workspace: mockWorkspace,
        },
      ]);

      const result = await service.findAllForUser('u1');

      expect(result).toEqual([
        {
          id: 'ws-1',
          name: 'Mi Workspace',
          slug: 'mi-workspace',
          description: null,
          role: 'owner',
          joinedAt: new Date('2026-01-01'),
        },
      ]);
    });
  });

  describe('findOne', () => {
    it('lanza NotFoundException si no existe', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('devuelve el workspace si existe', async () => {
      mockRepository.findById.mockResolvedValue(mockWorkspace);

      await expect(service.findOne('ws-1')).resolves.toEqual(mockWorkspace);
    });
  });

  describe('update', () => {
    it('lanza ForbiddenException si el rol es insuficiente (member < admin)', async () => {
      mockRepository.findById.mockResolvedValue(mockWorkspace);
      mockRepository.findMembership.mockResolvedValue({ role: 'member' });

      const dto: UpdateWorkspaceDto = { name: 'Nuevo Nombre' };

      await expect(service.update('u1', 'ws-1', dto)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('actualiza si el usuario es admin u owner', async () => {
      mockRepository.findById.mockResolvedValue(mockWorkspace);
      mockRepository.findMembership.mockResolvedValue({ role: 'admin' });
      mockRepository.update.mockResolvedValue({
        ...mockWorkspace,
        name: 'Nuevo Nombre',
      });

      const dto: UpdateWorkspaceDto = { name: 'Nuevo Nombre' };
      const result = await service.update('u1', 'ws-1', dto);

      expect(mockRepository.update).toHaveBeenCalledWith('ws-1', {
        name: 'Nuevo Nombre',
        description: undefined,
      });
      expect(result.name).toBe('Nuevo Nombre');
    });
  });

  describe('remove', () => {
    it('lanza ForbiddenException si el usuario no es owner', async () => {
      mockRepository.findById.mockResolvedValue(mockWorkspace);
      mockRepository.findMembership.mockResolvedValue({ role: 'admin' });

      await expect(service.remove('u1', 'ws-1')).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('elimina si el usuario es owner', async () => {
      mockRepository.findById.mockResolvedValue(mockWorkspace);
      mockRepository.findMembership.mockResolvedValue({ role: 'owner' });
      mockRepository.delete.mockResolvedValue(mockWorkspace);

      await service.remove('u1', 'ws-1');

      expect(mockRepository.delete).toHaveBeenCalledWith('ws-1');
    });
  });
});
