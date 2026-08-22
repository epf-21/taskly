import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import {
  MembersRepository,
  WorkspaceMemberWithUser,
} from './members.repository';

@Injectable()
export class MembersService {
  constructor(private readonly membersRepository: MembersRepository) {}

  findAll(workspaceId: string): Promise<WorkspaceMemberWithUser[]> {
    return this.membersRepository.findManyByWorkspace(workspaceId);
  }

  async updateRole(
    workspaceId: string,
    targetUserId: string,
    dto: UpdateMemberRoleDto,
  ): Promise<void> {
    const membership = await this.membersRepository.findByWorkspaceAndUserId(
      workspaceId,
      targetUserId,
    );

    if (!membership) {
      throw new NotFoundException('Miembro no encontrado');
    }

    if (membership.role === 'owner') {
      throw new ForbiddenException(
        'No se puede cambiar el rol del propietario del workspace',
      );
    }

    if (dto.role === 'owner') {
      throw new ConflictException(
        'El rol owner no se puede asignar; transfiere la propiedad del workspace',
      );
    }

    await this.membersRepository.updateRole(
      workspaceId,
      targetUserId,
      dto.role,
    );
  }

  async remove(workspaceId: string, targetUserId: string): Promise<void> {
    const membership = await this.membersRepository.findByWorkspaceAndUserId(
      workspaceId,
      targetUserId,
    );

    if (!membership) {
      throw new NotFoundException('Miembro no encontrado');
    }

    if (membership.role === 'owner') {
      throw new ForbiddenException(
        'No se puede remover al propietario del workspace',
      );
    }

    await this.membersRepository.delete(workspaceId, targetUserId);
  }
}
