import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateAttachmentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  fileName: string;

  @IsUrl()
  @MaxLength(512)
  fileUrl: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  fileSizeBytes?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  mimeType?: string;
}
