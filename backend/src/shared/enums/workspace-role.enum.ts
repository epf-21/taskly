import type { WorkspaceRole } from 'src/generated/prisma/enums';

export const WORKSPACE_ROLE_LEVEL: Record<WorkspaceRole, number> = {
  viewer: 1,
  member: 2,
  admin: 3,
  owner: 4,
};

export function meetsWorkspaceRole(
  role: WorkspaceRole,
  required: WorkspaceRole,
): boolean {
  return WORKSPACE_ROLE_LEVEL[role] >= WORKSPACE_ROLE_LEVEL[required];
}
