import type { AxiosError } from "axios";

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

export type ApiError = AxiosError<ApiErrorResponse>;
