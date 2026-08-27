import { Module } from '@nestjs/common';
import {
  ChecklistItemController,
  ChecklistItemsController,
  ChecklistsController,
} from './checklists.controller';
import { ChecklistsRepository } from './checklists.repository';
import { ChecklistsService } from './checklists.service';

@Module({
  controllers: [
    ChecklistsController,
    ChecklistItemsController,
    ChecklistItemController,
  ],
  providers: [ChecklistsRepository, ChecklistsService],
  exports: [ChecklistsService],
})
export class ChecklistsModule {}
