import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from 'src/modules/auth/strategies/jwt.strategy';
import { UsersService } from 'src/modules/users/users.service';

const mockUser = {
  id: 'u1',
  email: 'a@b.com',
  fullName: 'A B',
  isActive: true,
};

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const mockConfigService = {
    getOrThrow: jest.fn().mockReturnValue('access-secret'),
  };

  const mockUserService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: UsersService, useValue: mockUserService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('devuelve el usuario autenticado si existe y está activo', async () => {
    mockUserService.findOne.mockResolvedValue(mockUser);

    const result = await strategy.validate({ sub: 'u1', email: 'a@b.com' });

    expect(mockUserService.findOne).toHaveBeenCalledWith('u1');
    expect(result).toEqual({ id: 'u1', email: 'a@b.com', fullName: 'A B' });
  });

  it('lanza UnauthorizedException si el usuario está inactivo', async () => {
    mockUserService.findOne.mockResolvedValue({ ...mockUser, isActive: false });

    await expect(
      strategy.validate({ sub: 'u1', email: 'a@b.com' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('propaga el error si el usuario no existe', async () => {
    mockUserService.findOne.mockRejectedValue(
      new NotFoundException('Usuario no encontrado'),
    );

    await expect(
      strategy.validate({ sub: 'missing', email: 'x@y.com' }),
    ).rejects.toThrow(NotFoundException);
  });
});
