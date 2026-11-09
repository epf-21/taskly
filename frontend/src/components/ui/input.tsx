import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export const Input = ({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      className={cn(
        "min-h-11 w-full rounded-xl border border-taskly bg-taskly-surface-muted px-3.5 py-2.5 text-sm text-taskly-foreground outline-none transition placeholder:text-taskly-muted focus:border-brand-500 focus:bg-taskly-surface",
        className,
      )}
      {...props}
    />
  );
};
