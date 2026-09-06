import axios from "axios";

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const message = error.response?.data?.message;
  if (Array.isArray(message)) {
    return message.join(" ");
  }

  return typeof message === "string" ? message : fallback;
};
