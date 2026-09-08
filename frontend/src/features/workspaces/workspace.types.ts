export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  role: WorkspaceRole;
  joinedAt: string;
}

export interface CreateWorkspace {
  name: string;
  description?: string;
}
