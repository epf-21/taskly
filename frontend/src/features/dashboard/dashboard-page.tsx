import { Plus, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button, EmptyState, ModalDelete } from "@/components/ui";
import {
  DashboardSkeleton,
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
import { DashboardHeader, DashboardStats } from "./components";

export const DashboardPage = () => {
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
  const [deleteWorkspaceModalOpen, setDeleteWorkspaceModalOpen] =
    useState(false);
  const [archiveBoardTarget, setArchiveBoardTarget] = useState<Board | null>(
    null,
  );

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

    try {
      await deleteWorkspace.mutateAsync(selectedWorkspace.id);
      setSelectedWorkspaceId("");
      setDeleteWorkspaceModalOpen(false);
      toast.success("Workspace deleted");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to delete workspace"));
    }
  };

  const handleArchiveBoard = async (board: Board) => {
    try {
      await archiveBoard.mutateAsync(board.id);
      setArchiveBoardTarget(null);
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
      <DashboardHeader
        user={user}
        selectedWorkspace={selectedWorkspace}
        canManageWorkspace={canManageWorkspace}
        onNewWorkspace={() => {
          setEditingWorkspace(null);
          setWorkspaceDialogOpen(true);
        }}
        onNewBoard={() => {
          setEditingBoard(null);
          setBoardDialogOpen(true);
        }}
      />
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
              onEditWorkspace={() => {
                setEditingWorkspace(selectedWorkspace ?? null);
                setWorkspaceDialogOpen(true);
              }}
              onDeleteWorkspace={() => setDeleteWorkspaceModalOpen(true)}
              onEditBoard={setEditingBoard}
              onBoardDialogOpen={setBoardDialogOpen}
              onArchiveBoard={(board) => setArchiveBoardTarget(board)}
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
      {selectedWorkspace && (
        <ModalDelete
          open={deleteWorkspaceModalOpen}
          title="Delete workspace"
          description={`Are you sure you want to delete "${selectedWorkspace.name}"? This action cannot be undone.`}
          onClose={() => setDeleteWorkspaceModalOpen(false)}
          onAccept={handleDeleteWorkspace}
        />
      )}
      {archiveBoardTarget && (
        <ModalDelete
          open
          title="Archive board"
          description={`Are you sure you want to archive "${archiveBoardTarget.name}"? Its tasks will no longer appear in active boards.`}
          acceptLabel="Archive"
          onClose={() => setArchiveBoardTarget(null)}
          onAccept={() => handleArchiveBoard(archiveBoardTarget)}
        />
      )}
    </div>
  );
};
