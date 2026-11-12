import {
  DndContext,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { useState } from "react";
import type { BoardColumn } from "@/features/columns/columns.type";
import type { CreateTask, Task } from "@/features/tasks/tasks.type";
import { Button } from "@/components/ui";
import { TaskModal } from "@/features/tasks/components";
import { ColumnModal } from "@/features/columns/components";
import { KanbanColumn } from "@/features/columns/components/kanban-column";

export const KanbanBoard = ({
  columns,
  canManage,
  canEdit,
  onMoveTask,
  onCreateColumn,
  onCreateDefaultColumns,
  onEditColumn,
  onDeleteColumn,
  onCreateTask,
  onTaskOpen,
}: {
  columns: BoardColumn[];
  canManage: boolean;
  canEdit: boolean;
  onCreateDefaultColumns: () => Promise<void>;
  onMoveTask: (
    taskId: string,
    columnId: string,
    beforeId?: string,
    afterId?: string,
  ) => void;
  onCreateColumn: (name: string) => Promise<void>;
  onEditColumn: (column: BoardColumn) => Promise<void>;
  onDeleteColumn: (column: BoardColumn) => void;
  onCreateTask: (columnId: string, payload: CreateTask) => Promise<void>;
  onTaskOpen: (task: Task) => void;
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const [columnDialog, setColumnDialog] = useState<BoardColumn | "new" | null>(
    null,
  );
  const [taskColumnId, setTaskColumnId] = useState<string | null>(null);
  const [creatingDefaults, setCreatingDefaults] = useState(false);

  const handleCreateDefaults = async () => {
    setCreatingDefaults(true);
    try {
      await onCreateDefaultColumns();
    } finally {
      setCreatingDefaults(false);
    }
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const source = columns
      .flatMap((column) => column.tasks)
      .find((task) => task.id === active.id);
    const targetColumn =
      columns.find((column) => column.id === over.id) ??
      columns.find((column) =>
        column.tasks.some((task) => task.id === over.id),
      );
    if (!source || !targetColumn) return;
    const targetTasks = targetColumn.tasks.filter(
      (task) => task.id !== source.id,
    );
    const targetIndex = targetTasks.findIndex((task) => task.id === over.id);
    const beforeId =
      targetIndex > 0 ? targetTasks[targetIndex - 1].id : undefined;
    const afterId = targetIndex >= 0 ? targetTasks[targetIndex].id : undefined;
    onMoveTask(String(active.id), targetColumn.id, beforeId, afterId);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        {columns.length === 0 ? (
          canManage ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-taskly-strong bg-taskly-surface px-6 py-12 text-center">
              <h3 className="text-base font-semibold text-taskly-foreground">
                Set up your workflow
              </h3>
              <p className="mt-2 max-w-md text-sm text-taskly-muted">
                Start with the standard To do, In progress and Done columns, or
                create your own.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Button
                  onClick={() => void handleCreateDefaults()}
                  disabled={creatingDefaults}
                >
                  <Plus size={16} aria-hidden="true" />
                  {creatingDefaults ? "Adding columns..." : "Add default columns"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setColumnDialog("new")}
                >
                  <Plus size={16} aria-hidden="true" /> Add column
                </Button>
              </div>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-taskly-strong bg-taskly-surface px-6 py-10 text-center text-sm text-taskly-muted">
              This board has no columns yet.
            </p>
          )
        ) : (
          <div className="flex min-h-112 gap-4 overflow-x-auto pb-4">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                canManage={canManage}
                canEdit={canEdit}
                onEdit={() => setColumnDialog(column)}
                onDelete={() => onDeleteColumn(column)}
                onAddTask={() => setTaskColumnId(column.id)}
                onTaskOpen={onTaskOpen}
              />
            ))}
            {canManage && (
              <button
                type="button"
                onClick={() => setColumnDialog("new")}
                className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 self-start rounded-lg border border-taskly bg-taskly-surface px-3 text-xs font-medium text-taskly-muted transition-colors hover:border-taskly-strong hover:bg-taskly-surface-muted hover:text-taskly-foreground"
              >
                <Plus size={14} aria-hidden="true" /> Add column
              </button>
            )}
          </div>
        )}
      </DndContext>
      <ColumnModal
        value={columnDialog}
        onClose={() => setColumnDialog(null)}
        onSubmit={async (name) => {
          if (columnDialog === "new") await onCreateColumn(name);
          else if (columnDialog) await onEditColumn({ ...columnDialog, name });
          setColumnDialog(null);
        }}
      />
      <TaskModal
        open={Boolean(taskColumnId)}
        onClose={() => setTaskColumnId(null)}
        onSubmit={async (payload) => {
          if (taskColumnId) await onCreateTask(taskColumnId, payload);
          setTaskColumnId(null);
        }}
      />
    </>
  );
};
