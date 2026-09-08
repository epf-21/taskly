import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  CircleDashed,
  FolderKanban,
  ListTodo,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button, EmptyState } from "@/components/ui";
import {
  DashboardSkeleton,
  StatCard,
  WorkspaceDialog,
  WorkspaceDetails,
  WorkspaceBoards,
} from "@/features/workspaces/components";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useCurrentUser } from "@/features/auth/hook/use-current-user";
import {
  useWorkspaces,
  useCreateWorkspace,
  useDeleteWorkspace,
  useUpdateWorkspace,
} from "@/features/workspaces/hooks/use-workspaces";
import {
  useBoards,
  useArchiveBoard,
  useCreateBoard,
  useUpdateBoard,
} from "@/features/boards/hooks/use-boards";
import type { Workspace } from "@/features/workspaces/workspace.types";
import type { Board } from "@/features/boards/board.types";
import { BoardDialog } from "@/features/boards/components";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { data: user } = useCurrentUser();
  const {
    data: workData,
    isLoading: isLoadingWork,
    isError: isErrorWork,
    refetch: refetchWork,
  } = useWorkspaces();
  const workspaces = useMemo(() => workData ?? [], [workData]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [workspaceDialogOpen, setWorkspaceDialogOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(
    null,
  );
  const [boardDialogOpen, setBoardDialogOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);

  const activeWorkspaceId = workspaces.some(
    (workspace) => workspace.id === selectedWorkspaceId,
  )
    ? selectedWorkspaceId
    : (workspaces[0]?.id ?? "");

  const selectedWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.id === activeWorkspaceId),
    [activeWorkspaceId, workspaces],
  );
  const {
    data: boardData,
    isLoading: isLoadingBoard,
    isError: isErrorBoard,
    refetch: refetchBoard,
  } = useBoards(activeWorkspaceId);
  const createWorkspace = useCreateWorkspace();
  const updateWorkspace = useUpdateWorkspace();
  const deleteWorkspace = useDeleteWorkspace();
  const createBoard = useCreateBoard(activeWorkspaceId);
  const updateBoard = useUpdateBoard(activeWorkspaceId);
  const archiveBoard = useArchiveBoard(activeWorkspaceId);
  const canManageWorkspace =
    selectedWorkspace?.role === "owner" || selectedWorkspace?.role === "admin";
  const canDeleteWorkspace = selectedWorkspace?.role === "owner";

  const handleDeleteWorkspace = async () => {
    if (!selectedWorkspace || !canDeleteWorkspace) return;
    if (!window.confirm(`Delete "${selectedWorkspace.name}"?`)) return;

    try {
      await deleteWorkspace.mutateAsync(selectedWorkspace.id);
      setSelectedWorkspaceId("");
      toast.success("Workspace deleted");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to delete workspace"));
    }
  };

  const handleArchiveBoard = async (board: Board) => {
    if (!window.confirm(`Archive "${board.name}"?`)) return;
    try {
      await archiveBoard.mutateAsync(board.id);
      toast.success("Board archived");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to archive board"));
    }
  };

  if (isLoadingWork) {
    return <DashboardSkeleton />;
  }

  if (isErrorWork) {
    return (
      <EmptyState
        title="We couldn't load your workspaces"
        description="Check your connection and try again."
        action={
          <Button variant="secondary" onClick={() => refetchWork()}>
            <RefreshCw size={16} /> Try again
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <p className="mb-2 text-sm font-medium text-taskly-brand">
            Workspace overview
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Welcome back
            {user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}.
          </h1>
          <p className="mt-2 text-taskly-muted">
            Keep your projects moving from one focused workspace.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setEditingWorkspace(null);
              setWorkspaceDialogOpen(true);
            }}
          >
            <Plus size={17} /> New workspace
          </Button>
          {selectedWorkspace && canManageWorkspace && (
            <Button
              onClick={() => {
                setEditingBoard(null);
                setBoardDialogOpen(true);
              }}
            >
              <FolderKanban size={17} /> New board
            </Button>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Active tasks"
          value="—"
          detail="Coming with your boards"
          icon={<ListTodo size={18} />}
        />
        <StatCard
          label="Completed"
          value="—"
          detail="Track progress in each board"
          icon={<CheckCircle2 size={18} />}
          tone="success"
        />
        <StatCard
          label="Due soon"
          value="—"
          detail="Notifications will appear here"
          icon={<CircleDashed size={18} />}
          tone="warning"
        />
      </section>

      {workspaces.length === 0 ? (
        <EmptyState
          title="Create your first workspace"
          description="Workspaces keep your boards, members and tasks organized."
          action={
            <Button onClick={() => setWorkspaceDialogOpen(true)}>
              <Plus size={16} /> Create workspace
            </Button>
          }
        />
      ) : (
        <>
          <section className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)]">
            <WorkspaceDetails
              workspaces={workspaces}
              selectedWorkspaceId={selectedWorkspaceId}
              onSelected={setSelectedWorkspaceId}
            />

            <WorkspaceBoards
              workspace={selectedWorkspace}
              boards={boardData ?? []}
              isLoading={isLoadingBoard}
              isError={isErrorBoard}
              canManageWorkspace={canManageWorkspace}
              canDeleteWorkspace={canDeleteWorkspace}
              refetch={refetchBoard}
              onEditWorkspace={setEditingWorkspace}
              onDeleteWorkspace={handleDeleteWorkspace}
              onWorkspaceDialogOpen={setWorkspaceDialogOpen}
              onEditBoard={setEditingBoard}
              onBoardDialogOpen={setBoardDialogOpen}
              onArchiveBoard={handleArchiveBoard}
            />
          </section>
        </>
      )}

      <WorkspaceDialog
        key={editingWorkspace?.id ?? "new-workspace"}
        open={workspaceDialogOpen}
        title={editingWorkspace ? "Edit workspace" : "Create workspace"}
        initialValues={
          editingWorkspace
            ? {
                name: editingWorkspace.name,
                description: editingWorkspace.description ?? "",
              }
            : undefined
        }
        onClose={() => setWorkspaceDialogOpen(false)}
        onSubmit={async (payload) => {
          if (editingWorkspace) {
            await updateWorkspace.mutateAsync({
              workspaceId: editingWorkspace.id,
              payload,
            });
          } else {
            const workspace = await createWorkspace.mutateAsync(payload);
            setSelectedWorkspaceId(workspace.id);
          }
        }}
      />
      {activeWorkspaceId && (
        <BoardDialog
          key={editingBoard?.id ?? "new-board"}
          open={boardDialogOpen}
          title={editingBoard ? "Edit board" : "Create board"}
          initialValues={
            editingBoard
              ? {
                  name: editingBoard.name,
                  description: editingBoard.description ?? "",
                }
              : undefined
          }
          onClose={() => setBoardDialogOpen(false)}
          onSubmit={async (payload) => {
            if (editingBoard) {
              await updateBoard.mutateAsync({
                boardId: editingBoard.id,
                payload,
              });
            } else {
              await createBoard.mutateAsync(payload);
            }
          }}
        />
      )}
    </div>
  );
}
