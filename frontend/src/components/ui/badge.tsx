import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface Props extends HTMLAttributes<HTMLSpanElement> {
  tone?: "blue" | "green" | "amber" | "red" | "slate";
}

export const Badge = ({ className, tone = "slate", ...props }: Props) => {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide",
        {
          "border-brand-500/35 bg-brand-500/10 text-brand-400": tone === "blue",
          "border-success/35 bg-success/10 text-success": tone === "green",
          "border-warning/35 bg-warning/10 text-warning": tone === "amber",
          "border-danger/35 bg-danger/10 text-danger": tone === "red",
          "border-taskly-strong bg-taskly-surface-muted text-taskly-muted":
            tone === "slate",
        },
        className,
      )}
      {...props}
    />
  );
};
