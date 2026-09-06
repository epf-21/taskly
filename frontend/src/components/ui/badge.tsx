import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "blue" | "green" | "amber" | "red" | "slate";
}

export function Badge({ className, tone = "slate", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        {
          "bg-blue-500/15 text-blue-300": tone === "blue",
          "bg-green-500/15 text-green-300": tone === "green",
          "bg-amber-500/15 text-amber-300": tone === "amber",
          "bg-red-500/15 text-red-300": tone === "red",
          "bg-slate-700/70 text-slate-300": tone === "slate",
        },
        className,
      )}
      {...props}
    />
  );
}
