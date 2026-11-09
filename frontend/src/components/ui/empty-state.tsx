import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface Props {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({
  title,
  description,
  action,
  className,
}: Props) => {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-slate-700/90 bg-taskly-surface p-8 text-center",
        className,
      )}
    >
      <h2 className="font-semibold text-slate-100">{title}</h2>
      {description && (
        <p className="mt-2 text-sm text-taskly-muted">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};
