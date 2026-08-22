import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { WorkspaceRole } from 'src/generated/prisma/enums';

export class CreateInvitationDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(WorkspaceRole)
  role?: WorkspaceRole;
}
