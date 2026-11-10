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
        "rounded-xl border border-dashed border-taskly-strong bg-taskly-surface p-8 text-center",
        className,
      )}
    >
      <h2 className="font-semibold text-taskly-foreground">{title}</h2>
      {description && (
        <p className="mx-auto mt-2 max-w-sm text-sm text-taskly-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
};
