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
    <div className="group rounded-xl border border-taskly bg-taskly-surface-muted p-4 transition hover:border-blue-800">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-taskly-brand-soft text-taskly-brand">
            <FolderKanban size={17} />
          </span>
          <div className="min-w-0">
            <h4 className="truncate font-medium text-taskly-foreground">
              {board.name}
            </h4>
            <p className="mt-1 text-xs text-taskly-muted">
              Updated {new Date(board.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        {canManage && (
          <details className="relative">
            <summary className="cursor-pointer list-none text-taskly-muted hover:text-white">
              <MoreHorizontal size={17} />
            </summary>
            <div className="absolute right-0 top-6 z-10 min-w-28 rounded-lg border border-taskly bg-taskly-surface p-1 shadow-xl">
              <button
                type="button"
                onClick={onEdit}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-taskly-foreground hover:bg-taskly-surface-muted"
              >
                <Pencil size={13} /> Edit
              </button>
              <button
                type="button"
                onClick={onArchive}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-red-300 hover:bg-red-950/30"
              >
                <Archive size={13} /> Archive
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
        className="mt-4 flex items-center gap-1 text-xs font-medium text-taskly-brand hover:text-brand-500"
      >
        Open board <ArrowUpRight size={14} />
      </Link>
    </div>
  );
};
