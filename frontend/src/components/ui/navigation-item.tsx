import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

interface Props {
  to: "/dashboard" | "/workspaces" | "/notifications";
  icon: ReactNode;
  children: ReactNode;
  badge?: number;
  onClick?: () => void;
}

export const NavigationItem = ({
  to,
  icon,
  children,
  badge,
  onClick,
}: Props) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      activeProps={{
        className:
          "flex items-center gap-3 rounded-lg bg-taskly-brand-soft px-3 py-2.5 text-sm font-medium text-taskly-brand",
      }}
      inactiveProps={{
        className:
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-taskly-muted transition hover:bg-taskly-surface-muted hover:text-taskly-foreground",
      }}
    >
      {icon}
      <span>{children}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-auto rounded-full bg-taskly-brand px-2 py-0.5 text-[10px] text-white">
          {badge}
        </span>
      )}
    </Link>
  );
};
