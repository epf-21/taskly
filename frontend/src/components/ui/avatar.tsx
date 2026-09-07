import { cn } from "@/utils/cn";

interface Props {
  name: string;
  src?: string | null;
  className?: string;
}

export const Avatar = ({ name, src, className }: Props) => {
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
};
