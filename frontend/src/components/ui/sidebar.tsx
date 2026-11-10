import { useNotifications } from "@/features/notifications/use-notifications";
import { Link } from "@tanstack/react-router";
import { Bell, LayoutDashboard, Settings, Shapes } from "lucide-react";
import { NavigationItem } from "./navigation-item";

export const Sidebar = () => {
  const { data: notifications } = useNotifications();

  const unreadNotifications =
    notifications?.filter((notification) => !notification.readAt).length ?? 0;

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-taskly bg-taskly-surface p-5 lg:block">
      <Link to="/" className="mb-10 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-500/40 bg-brand-600 text-lg font-bold text-white">
          T
        </span>
        <span className="text-lg font-bold tracking-tight text-taskly-foreground">
          Taskly
        </span>
      </Link>
      <nav aria-label="Main navigation" className="space-y-1">
        <NavigationItem to="/dashboard" icon={<LayoutDashboard size={17} />}>
          Overview
        </NavigationItem>

        <NavigationItem to="/workspaces" icon={<Shapes size={17} />}>
          Workspaces
        </NavigationItem>

        <NavigationItem
          to="/notifications"
          icon={<Bell size={17} />}
          badge={unreadNotifications}
        >
          Notifications
        </NavigationItem>
      </nav>
      <button
        type="button"
        className="mt-10 flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm text-taskly-muted transition-colors hover:border-taskly-strong hover:bg-taskly-surface-muted hover:text-taskly-foreground"
      >
        <Settings size={17} aria-hidden="true" /> Settings
      </button>
    </aside>
  );
};
