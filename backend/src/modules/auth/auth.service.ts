import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import type { StringValue } from 'ms';
import { UserModel } from 'src/generated/prisma/models';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { AuthTokens, JwtPayload, RequestMeta } from './auth.interface';
import { AuthRepository } from './auth.repository';
import { LoginDto } from './dto/login.dto';
import { UserMapper } from '../users/users.mapper';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto, meta: RequestMeta = {}) {
    const saltRounds = this.config.get<number>('jwt.bcryptSaltRounds', 10);
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.userService.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
    });

    const tokens = await this.generateTokens(user, meta);

    return { user: UserMapper.toResponse(user), ...tokens };
  }

  async login(dto: LoginDto, meta: RequestMeta = {}) {
    const user = await this.userService.findByEmail(dto.email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    await this.userService.updateLastSeen(user.id);
    const tokens = await this.generateTokens(user, meta);
    return { user: UserMapper.toResponse(user), ...tokens };
  }

  async refresh(userId: string, rawRefreshToken: string): Promise<AuthTokens> {
    const tokenHash = this.hashToken(rawRefreshToken);

    const storedToken = await this.authRepository.findByToken(tokenHash);

    if (
      !storedToken ||
      storedToken.userId !== userId ||
      storedToken.revokedAt ||
      storedToken.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Token inválido');
    }

    const user = await this.userService.findOne(userId);

    await this.authRepository.updateById(storedToken.id, false);

    return this.generateTokens(user, {
      userAgent: storedToken.userAgent ?? undefined,
      ipAddress: storedToken.ipAddress ?? undefined,
    });
  }

  async logout(rawRefreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawRefreshToken);

    await this.authRepository.updateByToken(tokenHash);
  }

  async logoutAllDevices(userId: string): Promise<void> {
    await this.authRepository.updateById(userId);
  }

  private async generateTokens(
    user: UserModel,
    meta: RequestMeta,
  ): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.getOrThrow<string>('jwt.accessSecret'),
      expiresIn: this.config.get<string>('jwt.accessExpiresIn') as StringValue,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.getOrThrow<string>('jwt.refreshSecret'),
      expiresIn: this.config.get<string>('jwt.refreshExpiresIn') as StringValue,
    });

    await this.storeRefreshToken(user.id, refreshToken, meta);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(
    userId: string,
    rawToken: string,
    meta: RequestMeta,
  ): Promise<void> {
    const decoded = this.jwtService.decode<{ exp: number }>(rawToken);
    const expiresAt = new Date(decoded.exp * 1000);
    await this.authRepository.create({
      userId,
      tokenHash: this.hashToken(rawToken),
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
      expiresAt,
    });
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
