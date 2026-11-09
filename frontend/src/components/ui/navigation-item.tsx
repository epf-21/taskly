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
          "flex min-h-11 items-center gap-3 rounded-xl border border-taskly bg-taskly-brand-soft px-3 py-2.5 text-sm font-semibold text-white",
      }}
      inactiveProps={{
        className:
          "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-taskly-muted transition hover:bg-taskly-surface-muted hover:text-taskly-foreground",
      }}
    >
      {icon}
      <span>{children}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-auto rounded-full bg-taskly-brand px-2 py-0.5 text-[10px] font-semibold text-white">
          {badge}
        </span>
      )}
    </Link>
  );
};
