import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { CreateWorkspace, Workspace } from "../workspace.types";
import type { ApiError } from "@/shared/interfaces/api-interface";

export const useWorkspaces = () => {
  return useQuery<Workspace[], ApiError>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const response = await api.get<Workspace[]>("/workspaces");
      return response.data;
    },
  });
};

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation<Workspace, ApiError, CreateWorkspace>({
    mutationFn: async (payload) => {
      const response = await api.post<Workspace>("/workspaces", payload);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
};

export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Workspace,
    ApiError,
    { workspaceId: string; payload: Partial<CreateWorkspace> }
  >({
    mutationFn: async ({ workspaceId, payload }) => {
      const response = await api.patch<Workspace>(
        `/workspaces/${workspaceId}`,
        payload,
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
};

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: async (workspaceId) => {
      await api.delete(`/workspaces/${workspaceId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
};
