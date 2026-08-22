import { IsEnum } from 'class-validator';
import { WorkspaceRole } from 'src/generated/prisma/enums';

export class UpdateMemberRoleDto {
  @IsEnum(WorkspaceRole)
  role: WorkspaceRole;
}
