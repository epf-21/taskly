import { Module } from '@nestjs/common';
import { ActivityModule } from '../../activity/activity.module';
import {
  ChecklistItemController,
  ChecklistItemsController,
  ChecklistsController,
} from './checklists.controller';
import { ChecklistsRepository } from './checklists.repository';
import { ChecklistsService } from './checklists.service';

@Module({
  imports: [ActivityModule],
  controllers: [
    ChecklistsController,
    ChecklistItemsController,
    ChecklistItemController,
  ],
  providers: [ChecklistsRepository, ChecklistsService],
  exports: [ChecklistsService],
})
export class ChecklistsModule {}
