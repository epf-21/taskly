import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-taskly bg-taskly-surface shadow-xl shadow-slate-950/20",
        className,
      )}
      {...props}
    />
  );
}
