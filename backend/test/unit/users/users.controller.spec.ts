import { Test, TestingModule } from '@nestjs/testing';
import type { AuthenticatedUser } from 'src/common/interfaces/authenticated-request.interface';
import { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';
import { UsersController } from 'src/modules/users/users.controller';
import { UsersService } from 'src/modules/users/users.service';

const mockUser = {
  id: 'u1',
  email: 'a@b.com',
  fullName: 'A B',
  avatarUrl: null,
  isActive: true,
  lastSeenAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /users/me', () => {
    it('devuelve el perfil del usuario autenticado', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const currentUser: AuthenticatedUser = {
        id: 'u1',
        email: 'a@b.com',
        fullName: 'A B',
      };

      const result = await controller.getProfile(currentUser);

      expect(mockUsersService.findOne).toHaveBeenCalledWith('u1');
      expect(result.id).toBe('u1');
      expect(result.email).toBe('a@b.com');
    });
  });

  describe('PATCH /users/me', () => {
    it('actualiza y devuelve el perfil', async () => {
      mockUsersService.update.mockResolvedValue({
        ...mockUser,
        fullName: 'Nuevo Nombre',
      });

      const dto: UpdateUserDto = { fullName: 'Nuevo Nombre' };

      const result = await controller.updateProfile('u1', dto);

      expect(mockUsersService.update).toHaveBeenCalledWith('u1', dto);
      expect(result.fullName).toBe('Nuevo Nombre');
    });
  });
});