import { IsUUID } from 'class-validator';

export class CreateAssigneeDto {
  @IsUUID()
  userId: string;
}
