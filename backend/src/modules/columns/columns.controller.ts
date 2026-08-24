import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RequireBoardRole } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { BoardRolesGuard } from 'src/common/guards/board-roles.guard';
import { CreateColumnDto } from './dto/create-column.dto';
import { ReorderColumnDto } from './dto/reorder-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { ColumnsService } from './columns.service';

@UseGuards(JwtAuthGuard, BoardRolesGuard)
@Controller('boards/:boardId/columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequireBoardRole('admin')
  create(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Body() dto: CreateColumnDto,
  ) {
    return this.columnsService.create(boardId, dto);
  }

  @Patch('reorder')
  @RequireBoardRole('admin')
  reorder(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Body() dto: ReorderColumnDto,
  ) {
    return this.columnsService.reorder(boardId, dto);
  }
}

@UseGuards(JwtAuthGuard, BoardRolesGuard)
@Controller('columns/:columnId')
export class ColumnItemController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Patch()
  @RequireBoardRole('member')
  update(
    @Param('columnId', ParseUUIDPipe) columnId: string,
    @Body() dto: UpdateColumnDto,
  ) {
    return this.columnsService.update(columnId, dto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequireBoardRole('admin')
  async remove(
    @Param('columnId', ParseUUIDPipe) columnId: string,
  ): Promise<void> {
    await this.columnsService.remove(columnId);
  }
}
