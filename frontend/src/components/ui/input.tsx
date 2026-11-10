import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export const Input = ({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      className={cn(
        "min-h-11 w-full rounded-lg border border-taskly-strong bg-taskly-surface-muted px-3.5 py-2.5 text-sm text-taskly-foreground outline-none transition-colors placeholder:text-taskly-subtle focus:border-brand-400 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger aria-invalid:focus:border-danger",
        className,
      )}
      {...props}
    />
  );
};
