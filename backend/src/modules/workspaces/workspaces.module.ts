import { Module } from '@nestjs/common';
import { InvitationsController } from './invitations/invitations.controller';
import { InvitationsRepository } from './invitations/invitations.repository';
import { InvitationsService } from './invitations/invitations.service';
import { MembersController } from './members/members.controller';
import { MembersRepository } from './members/members.repository';
import { MembersService } from './members/members.service';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesRepository } from './workspaces.repository';
import { WorkspacesService } from './workspaces.service';

@Module({
  controllers: [WorkspacesController, MembersController, InvitationsController],
  providers: [
    WorkspacesService,
    WorkspacesRepository,
    MembersService,
    MembersRepository,
    InvitationsService,
    InvitationsRepository,
  ],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
