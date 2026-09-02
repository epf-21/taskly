import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { AcceptInvitationDto } from 'src/modules/workspaces/invitations/dto/accept-invitation.dto';
import { CreateInvitationDto } from 'src/modules/workspaces/invitations/dto/create-invitation.dto';
import { InvitationsRepository } from 'src/modules/workspaces/invitations/invitations.repository';
import { InvitationsService } from 'src/modules/workspaces/invitations/invitations.service';
import { WorkspacesRepository } from 'src/modules/workspaces/workspaces.repository';

const mockWorkspace = {
  id: 'ws-1',
  name: 'Mi Workspace',
  slug: 'mi-workspace',
  description: null,
  ownerId: 'u1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const pendingInvitation = (overrides: Record<string, unknown> = {}) => ({
  id: 'inv-1',
  workspaceId: 'ws-1',
  invitedEmail: 'invite@example.com',
  invitedBy: 'u1',
  role: 'member',
  token: 'token-123',
  status: 'pending',
  expiresAt: new Date(Date.now() + 60_000),
  createdAt: new Date(),
  ...overrides,
});

describe('InvitationsService', () => {
  let service: InvitationsService;

  const mockInvitationsRepository = {
    create: jest.fn(),
    findByToken: jest.fn(),
    findPendingByEmail: jest.fn(),
    findMembershipByEmail: jest.fn(),
    markAccepted: jest.fn(),
    createMembershipAndAccept: jest.fn(),
  };

  const mockWorkspacesRepository = {
    findById: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationsService,
        { provide: InvitationsRepository, useValue: mockInvitationsRepository },
        {
          provide: WorkspacesRepository,
          useValue: mockWorkspacesRepository,
        },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<InvitationsService>(InvitationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('lanza ConflictException si se invita con rol owner', async () => {
      const dto: CreateInvitationDto = {
        email: 'invite@example.com',
        role: 'owner',
      };

      await expect(service.create('ws-1', 'u1', dto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockInvitationsRepository.create).not.toHaveBeenCalled();
    });

    it('lanza ConflictException si el usuario ya es miembro', async () => {
      mockInvitationsRepository.findMembershipByEmail.mockResolvedValue({
        id: 'm-1',
      });

      const dto: CreateInvitationDto = { email: 'member@example.com' };

      await expect(service.create('ws-1', 'u1', dto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockInvitationsRepository.create).not.toHaveBeenCalled();
    });

    it('lanza ConflictException si ya existe una invitación pendiente', async () => {
      mockInvitationsRepository.findMembershipByEmail.mockResolvedValue(null);
      mockInvitationsRepository.findPendingByEmail.mockResolvedValue({
        id: 'inv-0',
      });

      const dto: CreateInvitationDto = { email: 'invite@example.com' };

      await expect(service.create('ws-1', 'u1', dto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockInvitationsRepository.create).not.toHaveBeenCalled();
    });

    it('crea la invitación con token y expiración a 7 días por defecto', async () => {
      mockInvitationsRepository.findMembershipByEmail.mockResolvedValue(null);
      mockInvitationsRepository.findPendingByEmail.mockResolvedValue(null);
      mockInvitationsRepository.create.mockResolvedValue({ id: 'inv-1' });

      const dto: CreateInvitationDto = { email: 'invite@example.com' };
      const before = Date.now();

      await service.create('ws-1', 'u1', dto);

      const [call] = mockInvitationsRepository.create.mock
        .calls[0] as unknown as [
        {
          workspaceId: string;
          invitedEmail: string;
          invitedBy: string;
          role: string;
          token: string;
          expiresAt: Date;
        },
      ];
      expect(call.workspaceId).toBe('ws-1');
      expect(call.invitedEmail).toBe('invite@example.com');
      expect(call.invitedBy).toBe('u1');
      expect(call.role).toBe('member');
      expect(call.token).toMatch(/^[a-f0-9]{64}$/);

      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      expect(call.expiresAt.getTime()).toBeGreaterThanOrEqual(
        before + sevenDays,
      );
      expect(call.expiresAt.getTime()).toBeLessThanOrEqual(
        Date.now() + sevenDays,
      );
    });
  });

  describe('accept', () => {
    it('lanza NotFoundException si el token no existe', async () => {
      mockInvitationsRepository.findByToken.mockResolvedValue(null);

      const dto: AcceptInvitationDto = { token: 'invalid' };

      await expect(
        service.accept('u2', 'invite@example.com', dto),
      ).rejects.toThrow(new NotFoundException('Invitación inválida'));
    });

    it('lanza NotFoundException si la invitación expiró', async () => {
      mockInvitationsRepository.findByToken.mockResolvedValue(
        pendingInvitation({ expiresAt: new Date(Date.now() - 1000) }),
      );

      const dto: AcceptInvitationDto = { token: 'token-123' };

      await expect(
        service.accept('u2', 'invite@example.com', dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza NotFoundException si la invitación ya fue aceptada', async () => {
      mockInvitationsRepository.findByToken.mockResolvedValue(
        pendingInvitation({ status: 'accepted' }),
      );

      const dto: AcceptInvitationDto = { token: 'token-123' };

      await expect(
        service.accept('u2', 'invite@example.com', dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza ForbiddenException si el email del usuario no coincide con el invitado', async () => {
      mockInvitationsRepository.findByToken.mockResolvedValue(
        pendingInvitation(),
      );

      const dto: AcceptInvitationDto = { token: 'token-123' };

      await expect(
        service.accept('u2', 'otro@example.com', dto),
      ).rejects.toThrow(
        new ForbiddenException('Esta invitación fue enviada a otro email'),
      );
    });

    it('marca como aceptada y devuelve alreadyMember si el usuario ya era miembro', async () => {
      mockInvitationsRepository.findByToken.mockResolvedValue(
        pendingInvitation(),
      );
      mockWorkspacesRepository.findById.mockResolvedValue(mockWorkspace);
      mockInvitationsRepository.findMembershipByEmail.mockResolvedValue({
        id: 'm-1',
        role: 'admin',
      });
      mockInvitationsRepository.markAccepted.mockResolvedValue(undefined);

      const dto: AcceptInvitationDto = { token: 'token-123' };
      const result = await service.accept('u2', 'invite@example.com', dto);

      expect(mockInvitationsRepository.markAccepted).toHaveBeenCalledWith(
        'inv-1',
      );
      expect(
        mockInvitationsRepository.createMembershipAndAccept,
      ).not.toHaveBeenCalled();
      expect(result.alreadyMember).toBe(true);
      expect(result.role).toBe('admin');
      expect(result.workspace.id).toBe('ws-1');
    });

    it('crea la membresía y acepta la invitación de forma atómica', async () => {
      mockInvitationsRepository.findByToken.mockResolvedValue(
        pendingInvitation(),
      );
      mockWorkspacesRepository.findById.mockResolvedValue(mockWorkspace);
      mockInvitationsRepository.findMembershipByEmail.mockResolvedValue(null);
      mockInvitationsRepository.createMembershipAndAccept.mockResolvedValue({
        role: 'member',
      });

      const dto: AcceptInvitationDto = { token: 'token-123' };
      const result = await service.accept('u2', 'invite@example.com', dto);

      expect(
        mockInvitationsRepository.createMembershipAndAccept,
      ).toHaveBeenCalledWith({
        workspaceId: 'ws-1',
        userId: 'u2',
        role: 'member',
        invitationId: 'inv-1',
      });
      expect(result.alreadyMember).toBe(false);
      expect(result.workspace.name).toBe('Mi Workspace');
      expect(result.role).toBe('member');
    });
  });
});
