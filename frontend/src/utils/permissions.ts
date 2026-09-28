import type { WorkspaceRole } from "@/features/workspaces/workspace.types";

export const getWorkspacePermissions = (role?: WorkspaceRole) => {
  return {
    canManage: role === "owner" || role === "admin",
    canDelete: role === "owner",
  };
};
