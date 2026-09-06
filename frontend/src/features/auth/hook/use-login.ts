import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, setTokens } from "../../../lib/api/client";
import type { AuthResponse } from "../auth.types";
import type { LoginDto } from "../dto/login-dto";
import type { ApiError } from "../../../shared/interfaces/api-interface";

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, ApiError, LoginDto>({
    mutationFn: async (data) => {
      const res = await api.post<AuthResponse>("/auth/login", data);
      return res.data;
    },
    onSuccess: async (data) => {
      setTokens(data.accessToken, data.refreshToken);
      await queryClient.invalidateQueries({
        queryKey: ["auth", "me"],
      });
    },
  });
};
