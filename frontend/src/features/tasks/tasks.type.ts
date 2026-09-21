export interface Task {
  id: string;
  columnId: string;
  boardId: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  dueDate: string | null;
  position: number;
  isArchived: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTask {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
}

export type TaskPriority = "low" | "medium" | "high" | "urgent";
