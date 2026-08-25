import { Module } from '@nestjs/common';
import { LabelsController } from './labels.controller';
import { LabelsRepository } from './labels.repository';
import { LabelsService } from './labels.service';

@Module({
  controllers: [LabelsController],
  providers: [LabelsRepository, LabelsService],
  exports: [LabelsService, LabelsRepository],
})
export class LabelsModule {}
