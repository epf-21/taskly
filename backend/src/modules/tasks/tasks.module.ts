import { Module } from '@nestjs/common';
import { ColumnsModule } from '../columns/columns.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { ChecklistsModule } from './checklists/checklists.module';
import { CommentsModule } from './comments/comments.module';
import {
  BoardTasksController,
  ColumnTasksController,
  TaskItemController,
} from './tasks.controller';
import { TasksRepository } from './tasks.repository';
import { TasksService } from './tasks.service';

@Module({
  imports: [ColumnsModule, CommentsModule, ChecklistsModule, AttachmentsModule],
  controllers: [
    ColumnTasksController,
    BoardTasksController,
    TaskItemController,
  ],
  providers: [TasksRepository, TasksService],
  exports: [TasksService],
})
export class TasksModule {}
