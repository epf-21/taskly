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
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold tracking-[0.01em] transition-colors duration-150 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50",
        {
          "bg-taskly-brand text-white hover:bg-brand-500":
            variant === "primary",
          "border border-taskly bg-taskly-surface-muted text-taskly-foreground hover:bg-taskly-surface":
            variant === "secondary",
          "text-taskly-muted hover:bg-taskly-surface-muted hover:text-taskly-foreground":
            variant === "ghost",
          "bg-red-700 text-white hover:bg-red-600":
            variant === "danger",
        },
        className,
      )}
      {...props}
    />
  );
};
