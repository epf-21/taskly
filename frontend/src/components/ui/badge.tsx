import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface Props extends HTMLAttributes<HTMLSpanElement> {
  tone?: "blue" | "green" | "amber" | "red" | "slate";
}

export const Badge = ({ className, tone = "slate", ...props }: Props) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide",
        {
          "border-blue-500/35 bg-blue-500/10 text-blue-200": tone === "blue",
          "border-green-500/35 bg-green-500/10 text-green-200":
            tone === "green",
          "border-amber-500/35 bg-amber-500/10 text-amber-200":
            tone === "amber",
          "border-red-500/35 bg-red-500/10 text-red-200": tone === "red",
          "border-slate-600/70 bg-slate-700/40 text-slate-200":
            tone === "slate",
        },
        className,
      )}
      {...props}
    />
  );
};
