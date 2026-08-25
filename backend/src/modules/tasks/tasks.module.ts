import { Module } from '@nestjs/common';
import { ColumnsModule } from '../columns/columns.module';
import {
  BoardTasksController,
  ColumnTasksController,
  TaskItemController,
} from './tasks.controller';
import { TasksRepository } from './tasks.repository';
import { TasksService } from './tasks.service';

@Module({
  imports: [ColumnsModule],
  controllers: [
    ColumnTasksController,
    BoardTasksController,
    TaskItemController,
  ],
  providers: [TasksRepository, TasksService],
  exports: [TasksService],
})
export class TasksModule {}
