import { IsOptional, IsUUID } from 'class-validator';

export class MoveTaskDto {
  @IsOptional()
  @IsUUID()
  columnId?: string;

  @IsOptional()
  @IsUUID()
  beforeId?: string;

  @IsOptional()
  @IsUUID()
  afterId?: string;
}
