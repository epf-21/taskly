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
        "rounded-2xl border border-dashed border-slate-700 p-8 text-center",
        className,
      )}
    >
      <h2 className="font-semibold text-slate-200">{title}</h2>
      {description && (
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};
