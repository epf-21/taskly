import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/shared/interfaces/api-interface";

export const pendingInvitationTokenKey = "taskly.pendingInvitationToken";

export interface AcceptedInvitation {
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
  role: "owner" | "admin" | "member" | "viewer";
  alreadyMember: boolean;
}

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation<AcceptedInvitation, ApiError, string>({
    mutationFn: async (token) =>
      (
        await api.post<AcceptedInvitation>("/workspaces/invitations/accept", {
          token,
        })
      ).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
};
