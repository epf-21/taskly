import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { queryClient } from "../lib/query-client";
import { currentUserQuery } from "../features/auth/queries/current-user-query";
import { getAccessToken } from "../lib/api/client";

export const Route = createFileRoute("/_public")({
  component: RouteComponent,
  beforeLoad: async () => {
    if (!getAccessToken()) {
      return;
    }
    let user;
    try {
      user = await queryClient.ensureQueryData(currentUserQuery());
    } catch {
      return;
    }
    if (user) {
      throw redirect({ to: "/dashboard" });
    }
  },
});

function RouteComponent() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-taskly-background px-4 py-10">
      <Outlet />
    </main>
  );
}
