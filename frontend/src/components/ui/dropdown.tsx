import type { ReactNode } from "react";

interface Props {
  label: string;
  children: ReactNode;
}

export const Dropdown = ({ label, children }: Props) => {
  return (
    <details className="relative">
      <summary className="cursor-pointer list-none rounded-md text-sm text-slate-300 transition hover:text-white">
        {label}
      </summary>
      <div className="absolute right-0 top-8 z-20 min-w-40 rounded-xl border border-taskly bg-taskly-surface p-1.5 shadow-xl shadow-slate-950/40">
        {children}
      </div>
    </details>
  );
};
