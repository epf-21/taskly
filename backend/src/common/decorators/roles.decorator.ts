import { SetMetadata } from '@nestjs/common';
import type { BoardRole, WorkspaceRole } from 'src/generated/prisma/enums';

export const WORKSPACE_ROLE_KEY = 'workspaceRole';
export const BOARD_ROLE_KEY = 'boardRole';

export const RequireWorkspaceRole = (role: WorkspaceRole) =>
  SetMetadata(WORKSPACE_ROLE_KEY, role);

export const RequireBoardRole = (role: BoardRole) =>
  SetMetadata(BOARD_ROLE_KEY, role);
