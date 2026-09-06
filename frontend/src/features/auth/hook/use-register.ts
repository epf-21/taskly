import { useMutation } from "@tanstack/react-query";
import { api, setTokens } from "@/lib/api/client";
import type { AuthResponse } from "../auth.types";
import type { ApiError } from "@/shared/interfaces/api-interface";
import type { RegisterDto } from "../dto/register-dto";

export const useRegister = () =>
  useMutation<AuthResponse, ApiError, RegisterDto>({
    mutationFn: async (data) => {
      const res = await api.post<AuthResponse>("/auth/register", data);
      return res.data;
    },
    onSuccess: async (data) => {
      setTokens(data.accessToken, data.refreshToken);
    },
  });
