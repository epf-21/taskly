import { Injectable, NotFoundException } from '@nestjs/common';
import { ActivityAction } from 'src/generated/prisma/enums';
import type { BoardModel } from 'src/generated/prisma/models';
import { ActivityService } from '../activity/activity.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { BoardDetail, BoardsRepository } from './boards.repository';

@Injectable()
export class BoardsService {
  constructor(
    private readonly boardsRepository: BoardsRepository,
    private readonly activityService: ActivityService,
  ) {}

  async create(
    userId: string,
    workspaceId: string,
    dto: CreateBoardDto,
  ): Promise<BoardModel> {
    const board = await this.boardsRepository.create({
      workspaceId,
      name: dto.name,
      description: dto.description,
      createdBy: userId,
    });

    await this.activityService.log({
      workspaceId,
      boardId: board.id,
      userId,
      action: ActivityAction.board_created,
      metadata: { boardId: board.id, name: board.name },
    });

    return board;
  }

  findAll(workspaceId: string, includeArchived = false): Promise<BoardModel[]> {
    return this.boardsRepository.findManyByWorkspace(
      workspaceId,
      includeArchived,
    );
  }

  async findDetail(boardId: string): Promise<BoardDetail> {
    const board = await this.boardsRepository.findDetailById(boardId);

    if (!board) {
      throw new NotFoundException('Board no encontrado');
    }

    return board;
  }

  async update(boardId: string, dto: UpdateBoardDto): Promise<BoardModel> {
    const board = await this.findExisting(boardId);

    const updatedBoard = await this.boardsRepository.update(board.id, dto);

    await this.activityService.log({
      workspaceId: board.workspaceId,
      boardId: board.id,
      userId: undefined,
      action: ActivityAction.board_updated,
      metadata: {
        boardId: board.id,
        name: updatedBoard.name,
        changedFields: Object.keys(dto),
      },
    });

    return updatedBoard;
  }

  async archive(boardId: string): Promise<void> {
    const board = await this.findExisting(boardId);

    await this.boardsRepository.update(board.id, { isArchived: true });

    await this.activityService.log({
      workspaceId: board.workspaceId,
      boardId: board.id,
      userId: undefined,
      action: ActivityAction.board_updated,
      metadata: { boardId: board.id, archived: true },
    });
  }

  private async findExisting(boardId: string) {
    const board = await this.boardsRepository.findById(boardId);

    if (!board) {
      throw new NotFoundException('Board no encontrado');
    }

    return board;
  }
}
