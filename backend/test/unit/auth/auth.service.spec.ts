import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AuthRepository } from 'src/modules/auth/auth.repository';
import { AuthService } from 'src/modules/auth/auth.service';
import { LoginDto } from 'src/modules/auth/dto/login.dto';
import { RegisterDto } from 'src/modules/auth/dto/register.dto';
import { UsersService } from 'src/modules/users/users.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  passwordHash: 'hashed-password',
  fullName: 'Test User',
  avatarUrl: null,
  isActive: true,
  lastSeenAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockStoredToken = {
  id: 'rt-1',
  userId: 'user-1',
  tokenHash: 'some-hash',
  userAgent: 'agent',
  ipAddress: '1.2.3.4',
  expiresAt: new Date(Date.now() + 3600_000),
  revokedAt: null,
  createdAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;

  const mockAuthRepository = {
    create: jest.fn(),
    findByToken: jest.fn(),
    updateByToken: jest.fn(),
    revokeById: jest.fn(),
    revokeAllByUserId: jest.fn(),
  };

  const mockUserService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findOne: jest.fn(),
    updateLastSeen: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    decode: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
    getOrThrow: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: mockAuthRepository },
        { provide: UsersService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    mockConfigService.get.mockImplementation((key: string) => {
      const values: Record<string, unknown> = {
        'jwt.bcryptSaltRounds': 10,
        'jwt.accessExpiresIn': '15m',
        'jwt.refreshExpiresIn': '7d',
      };
      return values[key];
    });

    mockConfigService.getOrThrow.mockImplementation((key: string) => {
      const values: Record<string, unknown> = {
        'jwt.accessSecret': 'access-secret',
        'jwt.refreshSecret': 'refresh-secret',
      };
      return values[key];
    });

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('hashea la contraseña, crea el usuario y devuelve tokens', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockUserService.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      mockJwtService.decode.mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

      const dto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      };

      const result = await service.register(dto, {
        userAgent: 'agent',
        ipAddress: '1.2.3.4',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockUserService.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        fullName: 'Test User',
      });
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user.email).toBe('test@example.com');
      expect(mockAuthRepository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        tokenHash: expect.any(String),
        userAgent: 'agent',
        ipAddress: '1.2.3.4',
        expiresAt: expect.any(Date),
      });
    });
  });

  describe('login', () => {
    it('devuelve tokens cuando las credenciales son válidas', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      mockJwtService.decode.mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await service.login(dto);

      expect(mockUserService.updateLastSeen).toHaveBeenCalledWith('user-1');
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('lanza UnauthorizedException si el email no está registrado (sin revelar el email)', async () => {
      mockUserService.findByEmail.mockRejectedValue(new Error('not found'));

      const dto: LoginDto = {
        email: 'desconocido@example.com',
        password: 'password123',
      };

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('lanza UnauthorizedException si el usuario está inactivo', async () => {
      mockUserService.findByEmail.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException si la contraseña es incorrecta', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockUserService.updateLastSeen).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    beforeEach(() => {
      mockAuthRepository.findByToken.mockResolvedValue(mockStoredToken);
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockJwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');
      mockJwtService.decode.mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
    });

    it('rota el refresh token y devuelve nuevos tokens', async () => {
      const result = await service.refresh('user-1', 'raw-refresh-token');

      expect(mockAuthRepository.findByToken).toHaveBeenCalledWith(
        crypto.createHash('sha256').update('raw-refresh-token').digest('hex'),
      );
      expect(mockAuthRepository.revokeById).toHaveBeenCalledWith('rt-1');
      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
    });

    it('lanza UnauthorizedException si el token no existe en la DB', async () => {
      mockAuthRepository.findByToken.mockResolvedValue(null);

      await expect(
        service.refresh('user-1', 'raw-refresh-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException si el token pertenece a otro usuario', async () => {
      mockAuthRepository.findByToken.mockResolvedValue({
        ...mockStoredToken,
        userId: 'other-user',
      });

      await expect(
        service.refresh('user-1', 'raw-refresh-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException si el token está revocado', async () => {
      mockAuthRepository.findByToken.mockResolvedValue({
        ...mockStoredToken,
        revokedAt: new Date(),
      });

      await expect(
        service.refresh('user-1', 'raw-refresh-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException si el token expiró', async () => {
      mockAuthRepository.findByToken.mockResolvedValue({
        ...mockStoredToken,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(
        service.refresh('user-1', 'raw-refresh-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('revoca el refresh token por su hash', async () => {
      await service.logout('raw-refresh-token');

      expect(mockAuthRepository.updateByToken).toHaveBeenCalledWith(
        crypto.createHash('sha256').update('raw-refresh-token').digest('hex'),
      );
    });
  });

  describe('logoutAllDevices', () => {
    it('revoca todos los refresh tokens del usuario', async () => {
      await service.logoutAllDevices('user-1');

      expect(mockAuthRepository.revokeAllByUserId).toHaveBeenCalledWith('user-1');
    });
  });
});
