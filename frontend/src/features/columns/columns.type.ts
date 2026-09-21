import type { Task } from "../tasks/tasks.type";

export interface BoardColumn {
  id: string;
  boardId: string;
  name: string;
  position: number;
  wipLimit: number | null;
  tasks: Task[];
}

export interface CreateColumn {
  name: string;
  wipLimit?: number;
}
