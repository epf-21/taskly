import type { Task } from "../boards/board.types";

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
