import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UserModel } from 'src/generated/prisma/models/User';
import { CreateUserData, UpdateUserData } from './users.interface';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateUserData): Promise<UserModel> {
    return this.prisma.user.create({ data });
  }

  findById(id: string): Promise<UserModel | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  findByEmail(email: string): Promise<UserModel | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  update(id: string, data: UpdateUserData): Promise<UserModel> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async deactivate(id: string): Promise<UserModel> {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
  async updateLastSeen(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        lastSeenAt: new Date(),
      },
    });
  }
}
