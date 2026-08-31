import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  RequireBoardRole,
  RequireWorkspaceRole,
} from 'src/common/decorators/roles.decorator';
import { BoardRolesGuard } from 'src/common/guards/board-roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { WorkspaceRolesGuard } from 'src/common/guards/workspace-roles.guard';
import { ActivityAction } from 'src/generated/prisma/enums';
import { ActivityService } from './activity.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('workspaces/:workspaceId/activity')
  @UseGuards(WorkspaceRolesGuard)
  @RequireWorkspaceRole('viewer')
  findWorkspaceActivity(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
    @Query('action', new DefaultValuePipe(undefined)) action?: string,
  ) {
    const normalizedAction = action
      ? (Object.values(ActivityAction).includes(action as ActivityAction)
          ? (action as ActivityAction)
          : undefined)
      : undefined;

    return this.activityService.findByWorkspace(
      workspaceId,
      limit,
      normalizedAction,
    );
  }

  @Get('boards/:boardId/activity')
  @UseGuards(BoardRolesGuard)
  @RequireBoardRole('viewer')
  findBoardActivity(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
    @Query('action', new DefaultValuePipe(undefined)) action?: string,
  ) {
    const normalizedAction = action
      ? (Object.values(ActivityAction).includes(action as ActivityAction)
          ? (action as ActivityAction)
          : undefined)
      : undefined;

    return this.activityService.findByBoard(boardId, limit, normalizedAction);
  }

  @Get('tasks/:taskId/activity')
  @UseGuards(BoardRolesGuard)
  @RequireBoardRole('viewer')
  findTaskActivity(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
    @Query('action', new DefaultValuePipe(undefined)) action?: string,
  ) {
    const normalizedAction = action
      ? (Object.values(ActivityAction).includes(action as ActivityAction)
          ? (action as ActivityAction)
          : undefined)
      : undefined;

    return this.activityService.findByTask(taskId, limit, normalizedAction);
  }
}
