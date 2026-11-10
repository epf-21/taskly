import { Link } from "@tanstack/react-router";
import {
  Archive,
  ArrowUpRight,
  FolderKanban,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import type { Board } from "@/features/boards/board.types";

export const BoardCard = ({
  board,
  canManage,
  onEdit,
  onArchive,
}: {
  board: Board;
  canManage: boolean;
  onEdit: () => void;
  onArchive: () => void;
}) => {
  return (
    <div className="group rounded-lg border border-taskly-strong bg-taskly-surface-muted p-4 transition-colors hover:border-brand-500/50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-taskly-brand-soft text-taskly-brand">
            <FolderKanban size={17} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h4 className="truncate font-medium text-taskly-foreground">
              {board.name}
            </h4>
            <p className="mt-1 text-xs text-taskly-subtle">
              Updated {new Date(board.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        {canManage && (
          <details className="relative">
            <summary
              className="cursor-pointer list-none rounded p-1 text-taskly-muted transition-colors hover:text-taskly-foreground"
              aria-label={`Board actions for ${board.name}`}
            >
              <MoreHorizontal size={17} aria-hidden="true" />
            </summary>
            <div className="absolute right-0 top-8 z-10 min-w-32 rounded-lg border border-taskly-strong bg-taskly-surface p-1 shadow-xl shadow-black/40">
              <button
                type="button"
                onClick={onEdit}
                className="flex w-full cursor-pointer items-center gap-2 rounded px-2 py-2 text-left text-xs text-taskly-foreground hover:bg-taskly-surface-muted"
              >
                <Pencil size={13} aria-hidden="true" /> Edit
              </button>
              <button
                type="button"
                onClick={onArchive}
                className="flex w-full cursor-pointer items-center gap-2 rounded px-2 py-2 text-left text-xs text-taskly-danger hover:bg-red-500/10"
              >
                <Archive size={13} aria-hidden="true" /> Archive
              </button>
            </div>
          </details>
        )}
      </div>
      <p className="mt-4 line-clamp-2 min-h-10 text-sm text-taskly-muted">
        {board.description || "Ready for your next project."}
      </p>
      <Link
        to="/boards/$boardId"
        params={{ boardId: board.id }}
        className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-taskly-brand hover:text-brand-500"
      >
        Open board <ArrowUpRight size={14} aria-hidden="true" />
      </Link>
    </div>
  );
};
