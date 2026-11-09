import type { ReactNode } from "react";

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export const Modal = ({ open, title, onClose, children }: Props) => {
  if (!open) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="w-full max-w-lg rounded-2xl border border-taskly bg-taskly-surface p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id="dialog-title" className="text-lg font-semibold text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition hover:bg-taskly-surface-muted hover:text-white"
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
};
