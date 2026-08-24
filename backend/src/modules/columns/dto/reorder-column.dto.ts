import { IsOptional, IsUUID } from 'class-validator';

export class ReorderColumnDto {
  @IsUUID()
  columnId: string;

  @IsOptional()
  @IsUUID()
  beforeId?: string;

  @IsOptional()
  @IsUUID()
  afterId?: string;
}
