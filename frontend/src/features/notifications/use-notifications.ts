import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/shared/interfaces/api-interface";
import type { Notification } from "./notification.types";

export const useNotifications = () =>
  useQuery<Notification[], ApiError>({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get<Notification[]>("/notifications")).data,
  });

export const useMarkNotificationRead = () => {
  const client = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: async (id) => {
      await api.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const client = useQueryClient();
  return useMutation<void, ApiError, void>({
    mutationFn: async () => {
      await api.patch("/notifications/read-all");
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
