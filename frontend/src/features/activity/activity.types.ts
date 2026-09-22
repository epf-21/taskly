export interface ActivityLog {
  id: string;
  workspaceId: string;
  boardId: string | null;
  taskId: string | null;
  userId: string | null;
  action: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}
