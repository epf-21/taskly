import { IsUUID } from 'class-validator';

export class CreateTaskLabelDto {
  @IsUUID()
  labelId: string;
}
