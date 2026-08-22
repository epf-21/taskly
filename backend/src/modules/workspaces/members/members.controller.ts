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
  UseGuards,
} from '@nestjs/common';
import { RequireWorkspaceRole } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { WorkspaceRolesGuard } from 'src/common/guards/workspace-roles.guard';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { MembersService } from './members.service';

@UseGuards(JwtAuthGuard, WorkspaceRolesGuard)
@Controller('workspaces/:id/members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @RequireWorkspaceRole('viewer')
  findAll(@Param('id', ParseUUIDPipe) workspaceId: string) {
    return this.membersService.findAll(workspaceId);
  }

  @Patch(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequireWorkspaceRole('admin')
  async updateRole(
    @Param('id', ParseUUIDPipe) workspaceId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateMemberRoleDto,
  ): Promise<void> {
    await this.membersService.updateRole(workspaceId, userId, dto);
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequireWorkspaceRole('admin')
  async remove(
    @Param('id', ParseUUIDPipe) workspaceId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<void> {
    await this.membersService.remove(workspaceId, userId);
  }
}
