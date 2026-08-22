import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/common/interfaces/authenticated-request.interface';
import { RequireWorkspaceRole } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { WorkspaceRolesGuard } from 'src/common/guards/workspace-roles.guard';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { InvitationsService } from './invitations.service';

@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post(':id/invitations')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(WorkspaceRolesGuard)
  @RequireWorkspaceRole('admin')
  create(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) workspaceId: string,
    @Body() dto: CreateInvitationDto,
  ) {
    return this.invitationsService.create(workspaceId, userId, dto);
  }

  @Post('invitations/accept')
  accept(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AcceptInvitationDto,
  ) {
    return this.invitationsService.accept(user.id, user.email, dto);
  }
}
