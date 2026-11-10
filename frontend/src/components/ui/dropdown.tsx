import type { ReactNode } from "react";

interface Props {
  label: string;
  children: ReactNode;
}

export const Dropdown = ({ label, children }: Props) => {
  return (
    <details className="relative">
      <summary className="cursor-pointer list-none rounded-md px-1 py-1 text-sm text-taskly-muted transition-colors hover:text-taskly-foreground">
        {label}
      </summary>
      <div className="absolute right-0 top-8 z-20 min-w-40 rounded-lg border border-taskly-strong bg-taskly-surface p-1.5 shadow-xl shadow-black/40">
        {children}
      </div>
    </details>
  );
};
