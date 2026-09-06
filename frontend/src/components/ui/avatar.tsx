import { cn } from "@/utils/cn";

interface AvatarProps {
  name: string;
  src?: string | null;
  className?: string;
}

export function Avatar({ name, src, className }: AvatarProps) {
  return src ? (
    <img
      src={src}
      alt={name}
      className={cn("h-9 w-9 rounded-full object-cover", className)}
    />
  ) : (
    <span
      aria-label={name}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-taskly-brand-soft text-sm font-semibold text-taskly-brand",
        className,
      )}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
