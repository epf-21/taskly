import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";

export const api = axios.create({
  baseURL: env.apiUrl,
  headers: { "Content-Type": "application/json" },
});

const refreshApi = axios.create({
  baseURL: env.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getAccessToken = () => localStorage.getItem(env.accessTokenKey);

export const getRefreshToken = () => localStorage.getItem(env.refreshTokenKey);

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(env.accessTokenKey, accessToken);
  localStorage.setItem(env.refreshTokenKey, refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem(env.accessTokenKey);
  localStorage.removeItem(env.refreshTokenKey);
};

api.interceptors.request.use((request) => {
  const token = getAccessToken();
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

let refreshPromise: Promise<string | null> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/")
    ) {
      throw error;
    }

    originalRequest._retry = true;
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });

    const token = await refreshPromise;
    if (!token) {
      throw error;
    }

    originalRequest.headers.Authorization = `Bearer ${token}`;
    return api(originalRequest);
  },
);

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    return null;
  }

  try {
    const { data } = await refreshApi.post<{
      accessToken: string;
      refreshToken: string;
    }>(
      "/auth/refresh",
      { refreshToken },
    );

    setTokens(data.accessToken, data.refreshToken);

    return data.accessToken;
  } catch {
    clearTokens();
    return null;
  }
};
