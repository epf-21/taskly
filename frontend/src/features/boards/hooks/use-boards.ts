import type { Board, CreateBoard } from "@/features/boards/board.types";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/shared/interfaces/api-interface";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useBoards = (workspaceId: string) => {
  return useQuery<Board[], ApiError>({
    queryKey: ["workspaces", workspaceId, "boards"],
    queryFn: async () => {
      const response = await api.get<Board[]>(
        `/workspaces/${workspaceId}/boards`,
      );
      return response.data;
    },
    enabled: Boolean(workspaceId),
  });
};

export const useCreateBoard = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation<Board, ApiError, CreateBoard>({
    mutationFn: async (payload) => {
      const response = await api.post<Board>(
        `/workspaces/${workspaceId}/boards`,
        payload,
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["workspaces", workspaceId, "boards"],
      });
    },
  });
};

export const useUpdateBoard = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    Board,
    ApiError,
    { boardId: string; payload: Partial<CreateBoard> }
  >({
    mutationFn: async ({ boardId, payload }) => {
      const response = await api.patch<Board>(`/boards/${boardId}`, payload);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["workspaces", workspaceId, "boards"],
      });
    },
  });
};

export const useArchiveBoard = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: async (boardId) => {
      await api.delete(`/boards/${boardId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["workspaces", workspaceId, "boards"],
      });
    },
  });
};

export const useBoardDetail = (boardId: string) => {
  return useQuery<Board, ApiError>({
    queryKey: ["boards", boardId],
    queryFn: async () => {
      const response = await api.get<Board>(`/boards/${boardId}`);
      return response.data;
    },
    enabled: Boolean(boardId),
  });
};
