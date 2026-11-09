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
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-taskly bg-taskly-brand text-lg font-bold">
          T
        </span>
        <span className="text-lg font-bold tracking-tight text-white">Taskly</span>
      </Link>
      <nav className="space-y-1">
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
      <button className="mt-10 flex min-h-11 w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm text-taskly-muted transition hover:border-taskly hover:bg-taskly-surface-muted hover:text-taskly-foreground">
        <Settings size={17} /> Settings
      </button>
    </aside>
  );
};
