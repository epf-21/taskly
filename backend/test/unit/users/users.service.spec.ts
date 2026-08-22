import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';
import { UsersRepository } from 'src/modules/users/users.repository';
import { UsersService } from 'src/modules/users/users.service';

const mockUser = {
  id: 'u1',
  email: 'a@b.com',
  passwordHash: 'hash',
  fullName: 'A B',
  avatarUrl: null,
  isActive: true,
  lastSeenAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UsersService', () => {
  let service: UsersService;

  const mockUsersRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    findByEmail: jest.fn(),
    deactivate: jest.fn(),
    updateLastSeen: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockUsersRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('lanza ConflictException si el email ya está registrado', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(mockUser);

      const dto: CreateUserDto = {
        email: 'a@b.com',
        passwordHash: 'hash',
        fullName: 'A B',
      };

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(mockUsersRepository.create).not.toHaveBeenCalled();
    });

    it('crea el usuario si el email está libre', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(null);
      mockUsersRepository.create.mockResolvedValue(mockUser);

      const dto: CreateUserDto = {
        email: 'a@b.com',
        passwordHash: 'hash',
        fullName: 'A B',
      };

      const result = await service.create(dto);

      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOne', () => {
    it('lanza NotFoundException si el usuario no existe', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('devuelve el usuario si existe', async () => {
      mockUsersRepository.findById.mockResolvedValue(mockUser);

      await expect(service.findOne('u1')).resolves.toEqual(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('lanza NotFoundException si el email no está registrado', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(null);

      await expect(service.findByEmail('a@b.com')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('devuelve el usuario si existe', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.findByEmail('a@b.com')).resolves.toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('lanza NotFoundException si el usuario no existe', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);

      const dto: UpdateUserDto = { fullName: 'Nuevo Nombre' };

      await expect(service.update('missing', dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUsersRepository.update).not.toHaveBeenCalled();
    });

    it('actualiza y devuelve el usuario', async () => {
      mockUsersRepository.findById.mockResolvedValue(mockUser);
      mockUsersRepository.update.mockResolvedValue({
        ...mockUser,
        fullName: 'Nuevo Nombre',
      });

      const dto: UpdateUserDto = { fullName: 'Nuevo Nombre' };

      const result = await service.update('u1', dto);

      expect(mockUsersRepository.update).toHaveBeenCalledWith('u1', dto);
      expect(result.fullName).toBe('Nuevo Nombre');
    });
  });

  describe('deactivate', () => {
    it('lanza NotFoundException si el usuario no existe', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);

      await expect(service.deactivate('missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('desactiva el usuario', async () => {
      mockUsersRepository.findById.mockResolvedValue(mockUser);
      mockUsersRepository.deactivate.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      const result = await service.deactivate('u1');

      expect(mockUsersRepository.deactivate).toHaveBeenCalledWith('u1');
      expect(result.isActive).toBe(false);
    });
  });

  describe('updateLastSeen', () => {
    it('delega en el repositorio', async () => {
      mockUsersRepository.updateLastSeen.mockResolvedValue(undefined);

      await service.updateLastSeen('u1');

      expect(mockUsersRepository.updateLastSeen).toHaveBeenCalledWith('u1');
    });
  });
});
