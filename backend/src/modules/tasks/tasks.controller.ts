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
import { RequireBoardRole } from 'src/common/decorators/roles.decorator';
import { BoardRolesGuard } from 'src/common/guards/board-roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateAssigneeDto } from './dto/create-assignee.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateTaskLabelDto } from './dto/create-task-label.dto';
import { FilterTasksDto } from './dto/filter-tasks.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@UseGuards(JwtAuthGuard, BoardRolesGuard)
@Controller('columns/:columnId/tasks')
export class ColumnTasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequireBoardRole('member')
  create(
    @CurrentUser('id') userId: string,
    @Param('columnId', ParseUUIDPipe) columnId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(userId, columnId, dto);
  }
}

@UseGuards(JwtAuthGuard, BoardRolesGuard)
@Controller('boards/:boardId/tasks')
export class BoardTasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @RequireBoardRole('viewer')
  findMany(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Query() filters: FilterTasksDto,
  ) {
    return this.tasksService.findManyByBoard(boardId, filters);
  }
}

@UseGuards(JwtAuthGuard, BoardRolesGuard)
@Controller('tasks/:taskId')
export class TaskItemController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @RequireBoardRole('viewer')
  findDetail(@Param('taskId', ParseUUIDPipe) taskId: string) {
    return this.tasksService.findDetail(taskId);
  }

  @Patch()
  @RequireBoardRole('member')
  update(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(taskId, dto);
  }

  @Patch('move')
  @RequireBoardRole('member')
  move(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: MoveTaskDto,
  ) {
    return this.tasksService.move(taskId, dto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequireBoardRole('member')
  async archive(@Param('taskId', ParseUUIDPipe) taskId: string): Promise<void> {
    await this.tasksService.archive(taskId);
  }

  @Post('assignees')
  @HttpCode(HttpStatus.CREATED)
  @RequireBoardRole('member')
  async addAssignee(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: CreateAssigneeDto,
  ): Promise<void> {
    await this.tasksService.addAssignee(taskId, dto);
  }

  @Delete('assignees/:assigneeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequireBoardRole('member')
  async removeAssignee(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('assigneeId', ParseUUIDPipe) assigneeId: string,
  ): Promise<void> {
    await this.tasksService.removeAssignee(taskId, assigneeId);
  }

  @Post('labels')
  @HttpCode(HttpStatus.CREATED)
  @RequireBoardRole('member')
  async addLabel(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: CreateTaskLabelDto,
  ): Promise<void> {
    await this.tasksService.addLabel(taskId, dto);
  }

  @Delete('labels/:labelId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequireBoardRole('member')
  async removeLabel(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('labelId', ParseUUIDPipe) labelId: string,
  ): Promise<void> {
    await this.tasksService.removeLabel(taskId, labelId);
  }
}
