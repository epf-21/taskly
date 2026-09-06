import { useNavigate } from "@tanstack/react-router";
import { api, getRefreshToken, clearTokens } from "@/lib/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/shared/interfaces/api-interface";

export const useLogout = () => {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  return useMutation<void, ApiError>({
    mutationFn: async () => {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        return;
      }

      await api.post("/auth/logout", { refreshToken });
    },

    onSettled: async () => {
      clearTokens();
      queryClient.clear();

      await navigate({ to: "/login", replace: true });
    },
  });
};
