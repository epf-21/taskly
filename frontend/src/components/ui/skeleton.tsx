import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export const Skeleton = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-lg bg-taskly-surface-muted",
        className,
      )}
      {...props}
    />
  );
};
