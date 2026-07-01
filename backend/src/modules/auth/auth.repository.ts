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

  async updateById(userId: string, flag: boolean = true): Promise<void> {
    if (flag) {
      await this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } else {
      await this.prisma.refreshToken.updateMany({
        where: { userId },
        data: { revokedAt: new Date() },
      });
    }
  }
}
