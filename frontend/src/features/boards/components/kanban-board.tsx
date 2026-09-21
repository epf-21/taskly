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
import type { CreateTask } from "@/features/tasks/tasks.type";
import { TaskModal } from "@/features/tasks/components";
import { ColumnModal } from "@/features/columns/components";
import { KanbanColumn } from "@/features/columns/components/kanban-column";

export const KanbanBoard = ({
  columns,
  canManage,
  canEdit,
  onMoveTask,
  onCreateColumn,
  onEditColumn,
  onDeleteColumn,
  onCreateTask,
}: {
  columns: BoardColumn[];
  canManage: boolean;
  canEdit: boolean;
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
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const [columnDialog, setColumnDialog] = useState<BoardColumn | "new" | null>(
    null,
  );
  const [taskColumnId, setTaskColumnId] = useState<string | null>(null);

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
            />
          ))}
          {canManage && (
            <button
              type="button"
              onClick={() => setColumnDialog("new")}
              className="flex h-24 min-w-72 items-center justify-center rounded-xl border border-dashed border-taskly bg-taskly-surface-muted text-sm text-taskly-muted hover:border-brand-500 hover:text-taskly-foreground"
            >
              <Plus size={16} className="mr-2" /> Add column
            </button>
          )}
        </div>
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
