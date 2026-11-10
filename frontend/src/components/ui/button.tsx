import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = ({ className, variant = "primary", ...props }: Props) => {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold tracking-[0.01em] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        {
          "bg-brand-600 text-white hover:bg-brand-500":
            variant === "primary",
          "border border-taskly-strong bg-taskly-surface-muted text-taskly-foreground hover:bg-taskly-elevated":
            variant === "secondary",
          "text-taskly-muted hover:bg-taskly-surface-muted hover:text-taskly-foreground":
            variant === "ghost",
          "bg-red-600 text-white hover:bg-red-700":
            variant === "danger",
        },
        className,
      )}
      {...props}
    />
  );
};
