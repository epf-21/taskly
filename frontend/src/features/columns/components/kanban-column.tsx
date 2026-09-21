import { useDroppable } from "@dnd-kit/core";
import type { BoardColumn } from "../columns.type";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button, EmptyState } from "@/components/ui";
import { TaskCard } from "@/features/tasks/components";

export const KanbanColumn = ({
  column,
  canManage,
  canEdit,
  onEdit,
  onDelete,
  onAddTask,
}: {
  column: BoardColumn;
  canManage: boolean;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAddTask: () => void;
}) => {
  const { setNodeRef } = useDroppable({ id: column.id });
  return (
    <section
      ref={setNodeRef}
      className="flex min-h-40 w-72 min-w-72 flex-col rounded-xl border border-taskly bg-taskly-surface-muted"
    >
      <div className="flex items-center justify-between border-b border-taskly px-4 py-3">
        <div>
          <h3 className="font-semibold text-taskly-foreground">
            {column.name}
          </h3>
          <p className="text-xs text-taskly-muted">
            {column.tasks.length} tasks
            {column.wipLimit ? ` / ${column.wipLimit}` : ""}
          </p>
        </div>
        {(canManage || canEdit) && (
          <details className="relative">
            <summary className="cursor-pointer list-none text-taskly-muted">
              <MoreHorizontal size={17} />
            </summary>
            <div className="absolute right-0 top-6 z-10 rounded-lg border border-taskly bg-taskly-surface p-1">
              {canEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="flex items-center gap-2 whitespace-nowrap rounded px-2 py-1.5 text-xs hover:bg-taskly-surface-muted"
                >
                  <Pencil size={13} /> Edit
                </button>
              )}
              {canManage && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="flex items-center gap-2 whitespace-nowrap rounded px-2 py-1.5 text-xs text-red-300 hover:bg-red-950/30"
                >
                  <Trash2 size={13} /> Delete
                </button>
              )}
            </div>
          </details>
        )}
      </div>
      <SortableContext
        items={column.tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-1 flex-col gap-2 p-3">
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
          {column.tasks.length === 0 && (
            <EmptyState
              title="No tasks"
              description="Add the first task here."
            />
          )}
        </div>
      </SortableContext>
      {canEdit && (
        <Button
          variant="ghost"
          className="m-2 justify-start"
          onClick={onAddTask}
        >
          <Plus size={15} /> Add task
        </Button>
      )}
    </section>
  );
};
