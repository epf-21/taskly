import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RequireBoardRole } from 'src/common/decorators/roles.decorator';
import { BoardRolesGuard } from 'src/common/guards/board-roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ChecklistsService } from './checklists.service';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { CreateChecklistDto } from './dto/create-checklist.dto';

@UseGuards(JwtAuthGuard, BoardRolesGuard)
@Controller('tasks/:taskId/checklists')
export class ChecklistsController {
  constructor(private readonly checklistsService: ChecklistsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequireBoardRole('member')
  create(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: CreateChecklistDto,
  ) {
    return this.checklistsService.create(taskId, dto);
  }
}

@UseGuards(JwtAuthGuard, BoardRolesGuard)
@Controller('checklists/:checklistId/items')
export class ChecklistItemsController {
  constructor(private readonly checklistsService: ChecklistsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequireBoardRole('member')
  addItem(
    @Param('checklistId', ParseUUIDPipe) checklistId: string,
    @Body() dto: CreateChecklistItemDto,
  ) {
    return this.checklistsService.addItem(checklistId, dto);
  }
}

@UseGuards(JwtAuthGuard, BoardRolesGuard)
@Controller('checklist-items/:itemId')
export class ChecklistItemController {
  constructor(private readonly checklistsService: ChecklistsService) {}

  @Patch('toggle')
  @HttpCode(HttpStatus.OK)
  @RequireBoardRole('member')
  toggle(@Param('itemId', ParseUUIDPipe) itemId: string) {
    return this.checklistsService.toggleItem(itemId);
  }
}
