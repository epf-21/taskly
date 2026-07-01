import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { UserModel } from 'src/generated/prisma/models';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(data: CreateUserDto): Promise<UserModel> {
    const existing = await this.usersRepository.findByEmail(data.email);

    if (existing) {
      throw new ConflictException('Ya existe una cuenta con este email');
    }

    return this.usersRepository.create(data);
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: string): Promise<UserModel> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserModel> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserModel> {
    await this.findOne(id);
    return this.usersRepository.update(id, dto);
  }

  updateLastSeen(id: string): Promise<void> {
    return this.usersRepository.updateLastSeen(id);
  }

  async deactivate(id: string): Promise<UserModel> {
    await this.findOne(id);
    return this.usersRepository.deactivate(id);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
