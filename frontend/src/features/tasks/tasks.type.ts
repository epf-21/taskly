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

export interface TaskAssignee {
  userId: string;
  user: { id: string; fullName: string; email: string };
}

export interface TaskLabel {
  labelId: string;
  label: { id: string; name: string; color: string };
}

export interface ChecklistItem {
  id: string;
  checklistId: string;
  content: string;
  isDone: boolean;
  position: number;
}

export interface Checklist {
  id: string;
  taskId: string;
  title: string;
  position: number;
  items: ChecklistItem[];
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string | null;
  content: string;
  editedAt: string | null;
  createdAt: string;
  user: { id: string; fullName: string; email: string } | null;
}

export interface TaskAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number | null;
  mimeType: string | null;
  createdAt: string;
}

export type TaskDetail = Task & {
  assignees: TaskAssignee[];
  labels: TaskLabel[];
  checklists: Checklist[];
  comments: TaskComment[];
  attachments: TaskAttachment[];
};

export interface CreateTask {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
}

export type TaskPriority = "low" | "medium" | "high" | "urgent";
