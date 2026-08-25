import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateLabelDto } from './create-label.dto';

export class UpdateLabelDto extends PartialType(
  PickType(CreateLabelDto, ['name', 'color'] as const),
) {}
