import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateMemberRoleDto } from 'src/modules/workspaces/members/dto/update-member-role.dto';
import { MembersRepository } from 'src/modules/workspaces/members/members.repository';
import { MembersService } from 'src/modules/workspaces/members/members.service';

describe('MembersService', () => {
  let service: MembersService;

  const mockRepository = {
    findManyByWorkspace: jest.fn(),
    findByWorkspaceAndUserId: jest.fn(),
    updateRole: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        { provide: MembersRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('delega en el repositorio', async () => {
      mockRepository.findManyByWorkspace.mockResolvedValue([]);

      await expect(service.findAll('ws-1')).resolves.toEqual([]);
      expect(mockRepository.findManyByWorkspace).toHaveBeenCalledWith('ws-1');
    });
  });

  describe('updateRole', () => {
    it('lanza NotFoundException si el miembro no existe', async () => {
      mockRepository.findByWorkspaceAndUserId.mockResolvedValue(null);

      const dto: UpdateMemberRoleDto = { role: 'admin' };

      await expect(service.updateRole('ws-1', 'missing', dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.updateRole).not.toHaveBeenCalled();
    });

    it('lanza ForbiddenException si el objetivo es el owner', async () => {
      mockRepository.findByWorkspaceAndUserId.mockResolvedValue({
        role: 'owner',
      });

      const dto: UpdateMemberRoleDto = { role: 'member' };

      await expect(
        service.updateRole('ws-1', 'owner-user', dto),
      ).rejects.toThrow(ForbiddenException);
      expect(mockRepository.updateRole).not.toHaveBeenCalled();
    });

    it('lanza ConflictException si se intenta asignar el rol owner', async () => {
      mockRepository.findByWorkspaceAndUserId.mockResolvedValue({
        role: 'member',
      });

      const dto: UpdateMemberRoleDto = { role: 'owner' };

      await expect(service.updateRole('ws-1', 'u2', dto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockRepository.updateRole).not.toHaveBeenCalled();
    });

    it('cambia el rol si es válido', async () => {
      mockRepository.findByWorkspaceAndUserId.mockResolvedValue({
        role: 'member',
      });
      mockRepository.updateRole.mockResolvedValue({ role: 'admin' });

      const dto: UpdateMemberRoleDto = { role: 'admin' };

      await service.updateRole('ws-1', 'u2', dto);

      expect(mockRepository.updateRole).toHaveBeenCalledWith(
        'ws-1',
        'u2',
        'admin',
      );
    });
  });

  describe('remove', () => {
    it('lanza NotFoundException si el miembro no existe', async () => {
      mockRepository.findByWorkspaceAndUserId.mockResolvedValue(null);

      await expect(service.remove('ws-1', 'missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('lanza ForbiddenException si el objetivo es el owner', async () => {
      mockRepository.findByWorkspaceAndUserId.mockResolvedValue({
        role: 'owner',
      });

      await expect(service.remove('ws-1', 'owner-user')).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('remueve al miembro si es válido', async () => {
      mockRepository.findByWorkspaceAndUserId.mockResolvedValue({
        role: 'member',
      });

      await service.remove('ws-1', 'u2');

      expect(mockRepository.delete).toHaveBeenCalledWith('ws-1', 'u2');
    });
  });
});
