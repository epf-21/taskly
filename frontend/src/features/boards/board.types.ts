import type { BoardColumn } from "../columns/columns.type";

export interface Board {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  isArchived: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  columns?: BoardColumn[];
}

export interface CreateBoard {
  name: string;
  description?: string;
}
