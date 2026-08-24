import { Module } from '@nestjs/common';
import {
  BoardsController,
  WorkspaceBoardsController,
} from './boards.controller';
import { BoardsRepository } from './boards.repository';
import { BoardsService } from './boards.service';

@Module({
  controllers: [WorkspaceBoardsController, BoardsController],
  providers: [BoardsRepository, BoardsService],
  exports: [BoardsService],
})
export class BoardsModule {}
