import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export const Card = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "rounded-2xl border border-taskly bg-taskly-surface",
        className,
      )}
      {...props}
    />
  );
};
