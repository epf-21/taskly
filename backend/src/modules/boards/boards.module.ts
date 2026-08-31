import { Module } from '@nestjs/common';
import { ActivityModule } from '../activity/activity.module';
import {
  BoardsController,
  WorkspaceBoardsController,
} from './boards.controller';
import { BoardsRepository } from './boards.repository';
import { BoardsService } from './boards.service';

@Module({
  imports: [ActivityModule],
  controllers: [WorkspaceBoardsController, BoardsController],
  providers: [BoardsRepository, BoardsService],
  exports: [BoardsService],
})
export class BoardsModule {}
