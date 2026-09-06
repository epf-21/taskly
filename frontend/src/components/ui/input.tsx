import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-taskly bg-taskly-background px-3 py-2 text-sm text-taskly-foreground outline-none transition placeholder:text-taskly-muted focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
        className,
      )}
      {...props}
    />
  );
}
