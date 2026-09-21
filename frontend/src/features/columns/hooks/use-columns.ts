import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { BoardColumn, CreateColumn } from "../columns.type";
import type { ApiError } from "@/shared/interfaces/api-interface";
import { api } from "@/lib/api/client";

export const useCreateColumn = (boardId: string) => {
  const queryClient = useQueryClient();
  return useMutation<BoardColumn, ApiError, CreateColumn>({
    mutationFn: async (payload) =>
      (await api.post<BoardColumn>(`/boards/${boardId}/columns`, payload)).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["boards", boardId] });
    },
  });
};

export const useUpdateColumn = (boardId: string) => {
  const queryClient = useQueryClient();
  return useMutation<
    BoardColumn,
    ApiError,
    { columnId: string; payload: Partial<CreateColumn> }
  >({
    mutationFn: async ({ columnId, payload }) =>
      (await api.patch<BoardColumn>(`/columns/${columnId}`, payload)).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["boards", boardId] });
    },
  });
};

export const useDeleteColumn = (boardId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: async (columnId) => {
      await api.delete(`/columns/${columnId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["boards", boardId] });
    },
  });
};
