import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  RequireBoardRole,
  RequireWorkspaceRole,
} from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { BoardRolesGuard } from 'src/common/guards/board-roles.guard';
import { WorkspaceRolesGuard } from 'src/common/guards/workspace-roles.guard';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { BoardsService } from './boards.service';

@UseGuards(JwtAuthGuard, WorkspaceRolesGuard)
@Controller('workspaces/:workspaceId/boards')
export class WorkspaceBoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequireWorkspaceRole('admin')
  create(
    @CurrentUser('id') userId: string,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Body() dto: CreateBoardDto,
  ) {
    return this.boardsService.create(userId, workspaceId, dto);
  }

  @Get()
  @RequireWorkspaceRole('viewer')
  findAll(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Query('includeArchived') includeArchived?: string,
  ) {
    const include = includeArchived === 'true';

    return this.boardsService.findAll(workspaceId, include);
  }
}

@UseGuards(JwtAuthGuard, BoardRolesGuard)
@Controller('boards/:boardId')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Get()
  @RequireBoardRole('viewer')
  findDetail(@Param('boardId', ParseUUIDPipe) boardId: string) {
    return this.boardsService.findDetail(boardId);
  }

  @Patch()
  @RequireBoardRole('admin')
  update(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Body() dto: UpdateBoardDto,
  ) {
    return this.boardsService.update(boardId, dto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequireBoardRole('admin')
  async archive(
    @Param('boardId', ParseUUIDPipe) boardId: string,
  ): Promise<void> {
    await this.boardsService.archive(boardId);
  }
}
