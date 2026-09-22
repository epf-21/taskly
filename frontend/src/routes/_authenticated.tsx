import { createFileRoute, redirect } from "@tanstack/react-router";
import { queryClient } from "../lib/query-client";
import { currentUserQuery } from "../features/auth/queries/current-user-query";
import { getAccessToken } from "../lib/api/client";
import { AuthLayout } from "@/components/layout/auth-layout";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
  beforeLoad: async () => {
    if (!getAccessToken()) {
      throw redirect({ to: "/login" });
    }
    try {
      await queryClient.ensureQueryData(currentUserQuery());
    } catch {
      throw redirect({ to: "/login" });
    }
  },
});
