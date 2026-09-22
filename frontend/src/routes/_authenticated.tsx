import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shapes,
} from "lucide-react";
import { useState } from "react";
import { queryClient } from "../lib/query-client";
import { currentUserQuery } from "../features/auth/queries/current-user-query";
import { useCurrentUser } from "../features/auth/hook/use-current-user";
import { useLogout } from "../features/auth/hook/use-logout";
import { useNotifications } from "../features/notifications/use-notifications";
import { getAccessToken } from "../lib/api/client";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
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

function RouteComponent() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const { data: user } = useCurrentUser();
  const { mutate: logout, isPending } = useLogout();
  const { data: notifications } = useNotifications();
  const unreadNotifications =
    notifications?.filter((notification) => !notification.readAt).length ?? 0;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isActive = (path: string) => pathname === path;
  const navItemClass = (active: boolean) =>
    active
      ? "flex items-center gap-3 rounded-lg bg-taskly-brand-soft px-3 py-2.5 text-sm font-medium text-taskly-brand"
      : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-taskly-muted transition hover:bg-taskly-surface-muted hover:text-taskly-foreground";
  const mobileNavItemClass = (active: boolean) =>
    active
      ? "flex items-center gap-2 rounded-lg bg-taskly-brand-soft px-3 py-2 text-sm text-taskly-brand"
      : "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-taskly-muted hover:bg-taskly-surface-muted";
  const currentSection = isActive("/workspaces")
    ? "Workspaces"
    : isActive("/notifications")
      ? "Notifications"
      : "Overview";

  return (
    <div className="min-h-screen bg-taskly-background text-taskly-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-taskly bg-taskly-surface p-5 lg:block">
          <Link to="/" className="mb-10 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-taskly-brand text-lg font-bold shadow-lg shadow-blue-950/50">
              T
            </span>
            <span className="text-lg font-bold tracking-tight">Taskly</span>
          </Link>
          <nav className="space-y-1">
            <Link
              to="/dashboard"
              className={navItemClass(isActive("/dashboard"))}
            >
              <LayoutDashboard size={17} /> Overview
            </Link>
            <Link
              to="/workspaces"
              className={navItemClass(isActive("/workspaces"))}
            >
              <Shapes size={17} /> Workspaces
            </Link>
            <Link
              to="/notifications"
              className={navItemClass(isActive("/notifications"))}
            >
              <Bell size={17} /> Notifications
              {unreadNotifications > 0 && (
                <span className="ml-auto rounded-full bg-taskly-brand px-2 py-0.5 text-[10px] text-white">
                  {unreadNotifications}
                </span>
              )}
            </Link>
          </nav>
          <button className="mt-10 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-taskly-muted transition hover:bg-taskly-surface-muted hover:text-taskly-foreground">
            <Settings size={17} /> Settings
          </button>
        </aside>
        <main className="min-w-0 flex-1">
          <header className="flex h-16 items-center justify-between border-b border-taskly px-5 sm:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Open navigation"
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="rounded-lg p-2 text-taskly-muted hover:bg-taskly-surface-muted hover:text-taskly-foreground lg:hidden"
              >
                <Menu size={19} />
              </button>
              <div className="text-sm text-taskly-muted">
                Workspace / {currentSection}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-taskly-muted sm:block">
                {user?.fullName ?? "User"}
              </span>
              <button
                type="button"
                title="Sign out"
                aria-label="Sign out"
                disabled={isPending}
                onClick={() => logout()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-taskly-brand-soft text-taskly-brand transition hover:bg-taskly-surface-muted"
              >
                <LogOut size={16} />
              </button>
            </div>
          </header>
          {mobileMenuOpen && (
            <nav className="border-b border-taskly bg-taskly-surface px-5 py-3 lg:hidden">
              <div className="grid gap-1 sm:grid-cols-3">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavItemClass(isActive("/dashboard"))}
                >
                  <LayoutDashboard size={16} /> Overview
                </Link>
                <Link
                  to="/workspaces"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavItemClass(isActive("/workspaces"))}
                >
                  <Shapes size={16} /> Workspaces
                </Link>
                <Link
                  to="/notifications"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavItemClass(isActive("/notifications"))}
                >
                  <Bell size={16} /> Notifications
                  {unreadNotifications > 0 && (
                    <span className="ml-auto rounded-full bg-taskly-brand px-2 py-0.5 text-[10px] text-white">
                      {unreadNotifications}
                    </span>
                  )}
                </Link>
              </div>
            </nav>
          )}
          <div className="mx-auto max-w-7xl p-5 sm:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
