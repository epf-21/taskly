import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { AuthController } from 'src/modules/auth/auth.controller';
import { AuthService } from 'src/modules/auth/auth.service';
import { LoginDto } from 'src/modules/auth/dto/login.dto';
import { RefreshTokenDto } from 'src/modules/auth/dto/refresh-token.dto';
import { RegisterDto } from 'src/modules/auth/dto/register.dto';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  };

  const mockReq = {
    headers: { 'user-agent': 'agent' },
    ip: '1.2.3.4',
  } as unknown as Request;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('delega en el servicio con el dto y el meta del request', async () => {
      mockAuthService.register.mockResolvedValue({
        accessToken: 'at',
        refreshToken: 'rt',
        user: { id: 'u1' },
      });

      const dto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      };

      const result = await controller.register(dto, mockReq);

      expect(mockAuthService.register).toHaveBeenCalledWith(dto, {
        userAgent: 'agent',
        ipAddress: '1.2.3.4',
      });
      expect(result).toEqual({
        accessToken: 'at',
        refreshToken: 'rt',
        user: { id: 'u1' },
      });
    });
  });

  describe('login', () => {
    it('delega en el servicio con el dto y el meta del request', async () => {
      mockAuthService.login.mockResolvedValue({
        accessToken: 'at',
        refreshToken: 'rt',
        user: { id: 'u1' },
      });

      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await controller.login(dto, mockReq);

      expect(mockAuthService.login).toHaveBeenCalledWith(dto, {
        userAgent: 'agent',
        ipAddress: '1.2.3.4',
      });
      expect(result.accessToken).toBe('at');
      expect(result.refreshToken).toBe('rt');
    });
  });

  describe('refresh', () => {
    it('delega en el servicio con el usuario del request', async () => {
      mockAuthService.refresh.mockResolvedValue({
        accessToken: 'at',
        refreshToken: 'rt',
      });

      const req = {
        user: { sub: 'u1', refreshToken: 'rt' },
      } as unknown as Request;

      const result = await controller.refresh(req as never);

      expect(mockAuthService.refresh).toHaveBeenCalledWith('u1', 'rt');
      expect(result).toEqual({ accessToken: 'at', refreshToken: 'rt' });
    });
  });

  describe('logout', () => {
    it('delega en el servicio con el refresh token', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      const dto: RefreshTokenDto = { refreshToken: 'rt' };

      await controller.logout(dto);

      expect(mockAuthService.logout).toHaveBeenCalledWith('rt');
    });
  });
});
