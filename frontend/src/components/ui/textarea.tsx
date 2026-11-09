import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export const Textarea = ({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full resize-y rounded-xl border border-taskly bg-taskly-surface-muted px-3.5 py-2.5 text-sm text-taskly-foreground outline-none transition placeholder:text-taskly-muted focus:border-brand-500 focus:bg-taskly-surface",
        className,
      )}
      {...props}
    />
  );
};
