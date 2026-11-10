import { useNotifications } from "@/features/notifications/use-notifications";
import { NavigationItem } from "./navigation-item";
import { Bell, LayoutDashboard, Shapes } from "lucide-react";

interface Props {
  open: boolean;
  onNavigate: () => void;
}

export const MobileNavigation = ({ open, onNavigate }: Props) => {
  const { data: notifications } = useNotifications();

  const unreadNotifications =
    notifications?.filter((notification) => !notification.readAt).length ?? 0;

  if (!open) return null;

  return (
    <nav
      aria-label="Main navigation"
      className="border-b border-taskly bg-taskly-surface px-5 py-3 lg:hidden"
    >
      <div className="grid gap-1 sm:grid-cols-3">
        <NavigationItem
          to="/dashboard"
          icon={<LayoutDashboard size={16} />}
          onClick={onNavigate}
        >
          Overview
        </NavigationItem>

        <NavigationItem
          to="/workspaces"
          icon={<Shapes size={16} />}
          onClick={onNavigate}
        >
          Workspaces
        </NavigationItem>

        <NavigationItem
          to="/notifications"
          icon={<Bell size={16} />}
          badge={unreadNotifications}
          onClick={onNavigate}
        >
          Notifications
        </NavigationItem>
      </div>
    </nav>
  );
};
