import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/shared/interfaces/api-interface";

export interface Label {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
}

export const useLabels = (workspaceId: string) =>
  useQuery<Label[], ApiError>({
    queryKey: ["workspaces", workspaceId, "labels"],
    queryFn: async () => (await api.get<Label[]>(`/workspaces/${workspaceId}/labels`)).data,
    enabled: Boolean(workspaceId),
  });

export const useCreateLabel = (workspaceId: string) => {
  const client = useQueryClient();
  return useMutation<Label, ApiError, { name: string; color?: string }>({
    mutationFn: async (payload) => (await api.post<Label>(`/workspaces/${workspaceId}/labels`, payload)).data,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["workspaces", workspaceId, "labels"] });
    },
  });
};

export const useUpdateLabel = (workspaceId: string) => {
  const client = useQueryClient();
  return useMutation<Label, ApiError, { labelId: string; payload: { name?: string; color?: string } }>({
    mutationFn: async ({ labelId, payload }) => (await api.patch<Label>(`/workspaces/${workspaceId}/labels/${labelId}`, payload)).data,
    onSuccess: () => { void client.invalidateQueries({ queryKey: ["workspaces", workspaceId, "labels"] }); },
  });
};

export const useDeleteLabel = (workspaceId: string) => {
  const client = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: async (labelId) => { await api.delete(`/workspaces/${workspaceId}/labels/${labelId}`); },
    onSuccess: () => { void client.invalidateQueries({ queryKey: ["workspaces", workspaceId, "labels"] }); },
  });
};
