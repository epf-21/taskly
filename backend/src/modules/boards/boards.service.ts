import { Injectable, NotFoundException } from '@nestjs/common';
import type { BoardModel } from 'src/generated/prisma/models';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { BoardDetail, BoardsRepository } from './boards.repository';

@Injectable()
export class BoardsService {
  constructor(private readonly boardsRepository: BoardsRepository) {}

  async create(
    userId: string,
    workspaceId: string,
    dto: CreateBoardDto,
  ): Promise<BoardModel> {
    return this.boardsRepository.create({
      workspaceId,
      name: dto.name,
      description: dto.description,
      createdBy: userId,
    });
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

    return this.boardsRepository.update(board.id, dto);
  }

  async archive(boardId: string): Promise<void> {
    const board = await this.findExisting(boardId);

    await this.boardsRepository.update(board.id, { isArchived: true });
  }

  private async findExisting(boardId: string) {
    const board = await this.boardsRepository.findById(boardId);

    if (!board) {
      throw new NotFoundException('Board no encontrado');
    }

    return board;
  }
}
