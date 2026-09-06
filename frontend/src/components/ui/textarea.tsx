import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full resize-y rounded-lg border border-taskly bg-taskly-background px-3 py-2 text-sm text-taskly-foreground outline-none transition placeholder:text-taskly-muted focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
        className,
      )}
      {...props}
    />
  );
}
