import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/70 disabled:cursor-not-allowed disabled:opacity-50",
        {
          "bg-taskly-brand text-white hover:bg-[#1d4ed8]": variant === "primary",
          "border border-taskly bg-taskly-brand-soft text-blue-100 hover:bg-[#132b63]":
            variant === "secondary",
          "text-taskly-muted hover:bg-taskly-surface-muted hover:text-taskly-foreground": variant === "ghost",
          "bg-red-600 text-white hover:bg-red-500": variant === "danger",
        },
        className,
      )}
      {...props}
    />
  );
}
