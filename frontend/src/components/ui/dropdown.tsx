import type { ReactNode } from "react";

interface DropdownProps {
  label: string;
  children: ReactNode;
}

export function Dropdown({ label, children }: DropdownProps) {
  return (
    <details className="relative">
      <summary className="cursor-pointer list-none text-sm text-slate-300 hover:text-white">
        {label}
      </summary>
      <div className="absolute right-0 top-8 z-20 min-w-40 rounded-lg border border-taskly bg-taskly-surface p-1 shadow-xl">
        {children}
      </div>
    </details>
  );
}
