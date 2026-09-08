import type { Board } from "@/features/boards/board.types";
import type { Workspace } from "../workspace.types";
import { Button, Card, EmptyState, Skeleton } from "@/components/ui";
import { Archive, Pencil, Plus, RefreshCw, Users } from "lucide-react";
import { BoardCard } from "@/features/boards/components";

interface Props {
  workspace: Workspace | undefined;
  boards: Board[] | undefined;
  isLoading: boolean;
  isError: boolean;
  canManageWorkspace: boolean;
  canDeleteWorkspace: boolean;
  refetch: () => void;
  onEditWorkspace: (workspace: Workspace) => void;
  onDeleteWorkspace: () => void;
  onWorkspaceDialogOpen: (value: boolean) => void;
  onEditBoard: (board: Board) => void;
  onBoardDialogOpen: (value: boolean) => void;
  onArchiveBoard: (board: Board) => void;
}

export const WorkspaceBoards = ({
  workspace,
  boards,
  isLoading,
  isError,
  canManageWorkspace,
  canDeleteWorkspace,
  refetch,
  onEditWorkspace,
  onDeleteWorkspace,
  onWorkspaceDialogOpen,
  onEditBoard,
  onBoardDialogOpen,
  onArchiveBoard,
}: Props) => {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-taskly px-5 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-taskly-brand">
            Selected workspace
          </p>
          <h2 className="mt-1 font-semibold text-white">{workspace?.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          {workspace && canManageWorkspace && (
            <Button
              variant="ghost"
              onClick={() => {
                onEditWorkspace(workspace);
                onWorkspaceDialogOpen(true);
              }}
            >
              <Pencil size={15} /> Edit
            </Button>
          )}
          {workspace && canDeleteWorkspace && (
            <Button variant="danger" onClick={() => onDeleteWorkspace()}>
              <Archive size={15} /> Delete
            </Button>
          )}
        </div>
      </div>
      <div className="p-5">
        {workspace?.description && (
          <p className="mb-5 text-sm text-taskly-muted">
            {workspace.description}
          </p>
        )}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-medium text-taskly-foreground">Boards</h3>
            <p className="mt-1 text-xs text-taskly-muted">
              {boards?.length ?? 0} active boards
            </p>
          </div>
          <Users size={17} className="text-taskly-muted" />
        </div>
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : isError ? (
          <EmptyState
            title="Boards unavailable"
            description="Try loading this workspace again."
            action={
              <Button variant="secondary" onClick={() => refetch()}>
                <RefreshCw size={15} /> Retry
              </Button>
            }
          />
        ) : boards?.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                canManage={canManageWorkspace}
                onEdit={() => {
                  onEditBoard(board);
                  onBoardDialogOpen(true);
                }}
                onArchive={() => onArchiveBoard(board)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No boards yet"
            description="Create a board to start organizing tasks."
            action={
              canManageWorkspace && (
                <Button onClick={() => onBoardDialogOpen(true)}>
                  <Plus size={15} /> Create board
                </Button>
              )
            }
          />
        )}
      </div>
    </Card>
  );
};
