import { Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useBoardDetail } from "./hooks/use-boards";
import {
  Badge,
  Button,
  EmptyState,
  Input,
  ModalDelete,
  Skeleton,
} from "@/components/ui";
import { getApiErrorMessage } from "@/lib/api/errors";
import { ArrowLeft, FolderKanban, Search } from "lucide-react";
import type { TaskPriority } from "@/features/tasks/tasks.type";
import type { BoardColumn } from "@/features/columns/columns.type";
import { KanbanBoard } from "./components";
import {
  useCreateColumn,
  useDeleteColumn,
  useUpdateColumn,
} from "../columns/hooks/use-columns";
import { useCreateTask, useMoveTask } from "../tasks/hooks/use-task";

export const BoardPage = () => {
  const { boardId } = useParams({ from: "/_authenticated/boards/$boardId" });

  const { data, isLoading, isError, error, refetch } = useBoardDetail(boardId);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<TaskPriority | "all">("all");
  const createColumn = useCreateColumn(boardId);
  const updateColumn = useUpdateColumn(boardId);
  const deleteColumn = useDeleteColumn(boardId);
  const createTask = useCreateTask(boardId);
  const moveTask = useMoveTask(boardId);
  const [deleteColumnTarget, setDeleteColumnTarget] =
    useState<BoardColumn | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-12 w-96 max-w-full" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Board unavailable"
        description={getApiErrorMessage(error, "Unable to load this board.")}
        action={
          <Button variant="secondary" onClick={() => refetch()}>
            Try again
          </Button>
        }
      />
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="Board not found"
        description="This board may have been removed or you may not have access to it."
        action={
          <Link to="/dashboard">
            <Button variant="secondary">Back to dashboard</Button>
          </Link>
        }
      />
    );
  }

  const board = data;

  return (
    <div className="space-y-6">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-taskly-muted hover:text-taskly-foreground"
      >
        <ArrowLeft size={16} /> Back to dashboard
      </Link>
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-taskly-brand-soft text-taskly-brand">
            <FolderKanban size={22} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-taskly-foreground">
                {board.name}
              </h1>
              <Badge tone={board.isArchived ? "slate" : "blue"}>
                {board.isArchived ? "Archived" : "Active"}
              </Badge>
            </div>
            <p className="mt-2 max-w-2xl text-taskly-muted">
              {board.description ||
                "This board is ready for tasks and collaboration."}
            </p>
          </div>
        </div>
      </section>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search
            size={16}
            className="absolute left-3 top-3 text-taskly-muted"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tasks..."
            className="pl-9"
          />
        </div>
        <select
          value={priority}
          onChange={(event) =>
            setPriority(event.target.value as TaskPriority | "all")
          }
          className="rounded-lg border border-taskly bg-taskly-surface-muted p-2.5 text-sm text-taskly-foreground"
        >
          <option value="all">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
      <KanbanBoard
        key={boardId}
        columns={data.columns.map((column) => ({
          ...column,
          tasks: column.tasks.filter(
            (task) =>
              (!search ||
                task.title.toLowerCase().includes(search.toLowerCase())) &&
              (priority === "all" || task.priority === priority),
          ),
        }))}
        canManage
        canEdit
        onMoveTask={(taskId, columnId, beforeId, afterId) =>
          moveTask.mutate(
            { taskId, columnId, beforeId, afterId },
            {
              onError: (moveError) =>
                toast.error(
                  getApiErrorMessage(moveError, "Unable to move task"),
                ),
            },
          )
        }
        onCreateColumn={async (name) => {
          await createColumn.mutateAsync({ name });
          toast.success("Column created");
        }}
        onEditColumn={async (column) => {
          await updateColumn.mutateAsync({
            columnId: column.id,
            payload: { name: column.name },
          });
          toast.success("Column updated");
        }}
        onDeleteColumn={(column) => setDeleteColumnTarget(column)}
        onCreateTask={async (columnId, payload) => {
          await createTask.mutateAsync({ columnId, payload });
          toast.success("Task created");
        }}
      />
      {deleteColumnTarget && (
        <ModalDelete
          open
          title="Delete column"
          description={`Are you sure you want to delete "${deleteColumnTarget.name}"? Tasks in this column may no longer be available.`}
          onClose={() => setDeleteColumnTarget(null)}
          onAccept={async () => {
            await deleteColumn.mutateAsync(deleteColumnTarget.id);
            setDeleteColumnTarget(null);
            toast.success("Column deleted");
          }}
        />
      )}
    </div>
  );
};
