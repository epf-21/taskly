import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { StoreRefreshToken } from './auth.interface';
import { RefreshTokenModel } from 'src/generated/prisma/models/RefreshToken';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: StoreRefreshToken) {
    await this.prisma.refreshToken.create({
      data,
    });
  }

  findByToken(tokenHash: string): Promise<RefreshTokenModel | null> {
    return this.prisma.refreshToken.findUnique({ where: { tokenHash } });
  }

  async updateByToken(tokenHash: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeById(id: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
