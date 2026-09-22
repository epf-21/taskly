import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/shared/interfaces/api-interface";
import type { WorkspaceRole } from "../workspace.types";

export interface WorkspaceMember {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: WorkspaceRole;
  joinedAt: string;
}

export const useWorkspaceMembers = (workspaceId: string) =>
  useQuery<WorkspaceMember[], ApiError>({
    queryKey: ["workspaces", workspaceId, "members"],
    queryFn: async () =>
      (await api.get<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`)).data,
    enabled: Boolean(workspaceId),
  });

export const useUpdateMemberRole = (workspaceId: string) => {
  const client = useQueryClient();
  return useMutation<void, ApiError, { userId: string; role: WorkspaceRole }>({
    mutationFn: async ({ userId, role }) => {
      await api.patch(`/workspaces/${workspaceId}/members/${userId}`, { role });
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["workspaces", workspaceId, "members"] });
      void client.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
};

export const useRemoveMember = (workspaceId: string) => {
  const client = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: async (userId) => {
      await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["workspaces", workspaceId, "members"] });
    },
  });
};

export const useInviteMember = (workspaceId: string) => {
  const client = useQueryClient();
  return useMutation<unknown, ApiError, { email: string; role: WorkspaceRole }>({
    mutationFn: async (payload) =>
      (await api.post(`/workspaces/${workspaceId}/invitations`, payload)).data,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["workspaces", workspaceId, "members"] });
    },
  });
};
