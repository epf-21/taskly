import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateTask, Task } from "../tasks.type";
import type { ApiError } from "@/shared/interfaces/api-interface";
import { api } from "@/lib/api/client";
import type { Board } from "@/features/boards/board.types";
import type { BoardColumn } from "@/features/columns/columns.type";

export const useCreateTask = (boardId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Task, ApiError, { columnId: string; payload: CreateTask }>(
    {
      mutationFn: async ({ columnId, payload }) =>
        (await api.post<Task>(`/columns/${columnId}/tasks`, payload)).data,
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ["boards", boardId] });
      },
    },
  );
};

export const useMoveTask = (boardId: string) => {
  const queryClient = useQueryClient();
  return useMutation<
    Task,
    ApiError,
    { taskId: string; columnId?: string; beforeId?: string; afterId?: string },
    { previous?: Board & { columns: BoardColumn[] } }
  >({
    mutationFn: async ({ taskId, columnId, beforeId, afterId }) =>
      (
        await api.patch<Task>(`/tasks/${taskId}/move`, {
          columnId,
          beforeId,
          afterId,
        })
      ).data,
    onMutate: async (move) => {
      await queryClient.cancelQueries({ queryKey: ["boards", boardId] });
      const previous = queryClient.getQueryData<
        Board & { columns: BoardColumn[] }
      >(["boards", boardId]);
      if (previous && move.columnId) {
        const columns = previous.columns.map((column) => ({
          ...column,
          tasks: column.tasks.filter((task) => task.id !== move.taskId),
        }));
        const sourceTask = previous.columns
          .flatMap((column) => column.tasks)
          .find((task) => task.id === move.taskId);
        const target = columns.find((column) => column.id === move.columnId);
        if (sourceTask && target) {
          const index = move.afterId
            ? target.tasks.findIndex((task) => task.id === move.afterId)
            : target.tasks.length;
          target.tasks.splice(index < 0 ? target.tasks.length : index, 0, {
            ...sourceTask,
            columnId: target.id,
          });
          queryClient.setQueryData(["boards", boardId], {
            ...previous,
            columns,
          });
        }
      }
      return { previous };
    },
    onError: (_error, _move, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["boards", boardId], context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["boards", boardId] });
    },
  });
};

export const useBoardTasks = (
  boardId: string,
  filters: {
    priority?: TaskPriority;
    search?: string;
  },
) =>
  useQuery<Task[], ApiError>({
    queryKey: ["boards", boardId, "tasks", filters],
    queryFn: async () =>
      (await api.get<Task[]>(`/boards/${boardId}/tasks`, { params: filters }))
        .data,
    enabled: Boolean(boardId),
  });
