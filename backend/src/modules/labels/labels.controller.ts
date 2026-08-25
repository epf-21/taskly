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
  UseGuards,
} from '@nestjs/common';
import { RequireWorkspaceRole } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { WorkspaceRolesGuard } from 'src/common/guards/workspace-roles.guard';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
import { LabelsService } from './labels.service';

@UseGuards(JwtAuthGuard, WorkspaceRolesGuard)
@Controller('workspaces/:workspaceId/labels')
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequireWorkspaceRole('admin')
  create(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Body() dto: CreateLabelDto,
  ) {
    return this.labelsService.create(workspaceId, dto);
  }

  @Get()
  @RequireWorkspaceRole('viewer')
  findAll(@Param('workspaceId', ParseUUIDPipe) workspaceId: string) {
    return this.labelsService.findAll(workspaceId);
  }

  @Patch(':labelId')
  @RequireWorkspaceRole('admin')
  update(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('labelId', ParseUUIDPipe) labelId: string,
    @Body() dto: UpdateLabelDto,
  ) {
    return this.labelsService.update(workspaceId, labelId, dto);
  }

  @Delete(':labelId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequireWorkspaceRole('admin')
  async remove(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('labelId', ParseUUIDPipe) labelId: string,
  ): Promise<void> {
    await this.labelsService.remove(workspaceId, labelId);
  }
}
