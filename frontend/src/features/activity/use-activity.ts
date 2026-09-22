import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/shared/interfaces/api-interface";
import type { ActivityLog } from "./activity.types";

export const useActivity = (
  scope: "workspace" | "board" | "task",
  id: string,
) =>
  useQuery<ActivityLog[], ApiError>({
    queryKey: ["activity", scope, id],
    queryFn: async () =>
      (
        await api.get<ActivityLog[]>(
          `/${scope === "workspace" ? "workspaces" : `${scope}s`}/${id}/activity`,
        )
      ).data,
    enabled: Boolean(id),
  });

export const activityLabel = (action: string) =>
  action.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
