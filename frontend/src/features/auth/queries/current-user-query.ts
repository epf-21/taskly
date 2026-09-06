import { queryOptions } from "@tanstack/react-query";
import { api, getAccessToken } from "../../../lib/api/client";
import type { User } from "../auth.types";

export const currentUserQuery = () =>
  queryOptions({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await api.get<User>("/users/me");
      return res.data;
    },
    enabled: !!getAccessToken(),
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
