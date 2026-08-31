import { Module } from '@nestjs/common';
import { ActivityModule } from '../activity/activity.module';
import { LabelsController } from './labels.controller';
import { LabelsRepository } from './labels.repository';
import { LabelsService } from './labels.service';

@Module({
  imports: [ActivityModule],
  controllers: [LabelsController],
  providers: [LabelsRepository, LabelsService],
  exports: [LabelsService, LabelsRepository],
})
export class LabelsModule {}
