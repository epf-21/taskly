export interface Board {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  isArchived: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoard {
  name: string;
  description?: string;
}
