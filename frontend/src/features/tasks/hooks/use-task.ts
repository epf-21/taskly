import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Checklist,
  ChecklistItem,
  CreateTask,
  Task,
  TaskComment,
  TaskDetail,
} from "../tasks.type";
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

export const useTaskDetail = (taskId: string | null) =>
  useQuery<TaskDetail, ApiError>({
    queryKey: ["tasks", taskId],
    queryFn: async () => (await api.get<TaskDetail>(`/tasks/${taskId}`)).data,
    enabled: Boolean(taskId),
  });

export const useUpdateTask = (boardId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Task, ApiError, { taskId: string; payload: Partial<CreateTask> }>({
    mutationFn: async ({ taskId, payload }) =>
      (await api.patch<Task>(`/tasks/${taskId}`, payload)).data,
    onSuccess: (task) => {
      void queryClient.invalidateQueries({ queryKey: ["boards", boardId] });
      void queryClient.invalidateQueries({ queryKey: ["tasks", task.id] });
    },
  });
};

export const useCreateComment = (taskId: string) => {
  const queryClient = useQueryClient();
  return useMutation<TaskComment, ApiError, string>({
    mutationFn: async (content) =>
      (await api.post<TaskComment>(`/tasks/${taskId}/comments`, { content })).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks", taskId] });
    },
  });
};

export const useUpdateComment = (taskId: string) => {
  const queryClient = useQueryClient();
  return useMutation<TaskComment, ApiError, { commentId: string; content: string }>({
    mutationFn: async ({ commentId, content }) =>
      (await api.patch<TaskComment>(`/comments/${commentId}`, { content })).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks", taskId] });
    },
  });
};

export const useDeleteComment = (taskId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: async (commentId) => {
      await api.delete(`/comments/${commentId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks", taskId] });
    },
  });
};

export const useCreateChecklist = (taskId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Checklist, ApiError, string>({
    mutationFn: async (title) =>
      (await api.post<Checklist>(`/tasks/${taskId}/checklists`, { title })).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks", taskId] });
    },
  });
};

export const useCreateChecklistItem = (taskId: string) => {
  const queryClient = useQueryClient();
  return useMutation<ChecklistItem, ApiError, { checklistId: string; content: string }>({
    mutationFn: async ({ checklistId, content }) =>
      (await api.post<ChecklistItem>(`/checklists/${checklistId}/items`, { content })).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks", taskId] });
    },
  });
};

export const useToggleChecklistItem = (taskId: string) => {
  const queryClient = useQueryClient();
  return useMutation<ChecklistItem, ApiError, string>({
    mutationFn: async (itemId) =>
      (await api.patch<ChecklistItem>(`/checklist-items/${itemId}/toggle`)).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks", taskId] });
    },
  });
};

export const useAddTaskAssignee = (taskId: string) => {
  const client = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: async (userId) => {
      await api.post(`/tasks/${taskId}/assignees`, { userId });
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["tasks", taskId] });
    },
  });
};

export const useRemoveTaskAssignee = (taskId: string) => {
  const client = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: async (userId) => {
      await api.delete(`/tasks/${taskId}/assignees/${userId}`);
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["tasks", taskId] });
    },
  });
};

export const useAddTaskLabel = (taskId: string) => {
  const client = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: async (labelId) => {
      await api.post(`/tasks/${taskId}/labels`, { labelId });
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["tasks", taskId] });
    },
  });
};

export const useRemoveTaskLabel = (taskId: string) => {
  const client = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: async (labelId) => {
      await api.delete(`/tasks/${taskId}/labels/${labelId}`);
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["tasks", taskId] });
    },
  });
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
