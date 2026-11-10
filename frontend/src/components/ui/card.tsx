import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export const Card = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-taskly bg-taskly-surface shadow-sm shadow-black/20",
        className,
      )}
      {...props}
    />
  );
};
