import { plainToInstance } from 'class-transformer';
import { UserModel } from 'src/generated/prisma/models';
import { UserResponseDto } from './dto/user-response.dto';

export class UserMapper {
  static toResponse(user: UserModel): UserResponseDto {
    return plainToInstance(UserResponseDto, user);
  }
}
