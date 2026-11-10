import { useDroppable } from "@dnd-kit/core";
import type { BoardColumn } from "../columns.type";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui";
import { TaskCard } from "@/features/tasks/components";
import type { Task } from "@/features/tasks/tasks.type";

export const KanbanColumn = ({
  column,
  canManage,
  canEdit,
  onEdit,
  onDelete,
  onAddTask,
  onTaskOpen,
}: {
  column: BoardColumn;
  canManage: boolean;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAddTask: () => void;
  onTaskOpen: (task: Task) => void;
}) => {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <section
      ref={setNodeRef}
      className="flex min-h-40 w-72 min-w-72 flex-col rounded-xl border border-taskly bg-taskly-surface-muted"
    >
      <div className="flex items-center justify-between gap-2 border-b border-taskly px-4 py-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-taskly-foreground">
            {column.name}
          </h3>
          <p className="text-xs text-taskly-subtle">
            {column.tasks.length} tasks
            {column.wipLimit ? ` / ${column.wipLimit}` : ""}
          </p>
        </div>
        {(canManage || canEdit) && (
          <details className="relative">
            <summary
              className="cursor-pointer list-none rounded p-1 text-taskly-muted transition-colors hover:text-taskly-foreground"
              aria-label={`Column actions for ${column.name}`}
            >
              <MoreHorizontal size={17} aria-hidden="true" />
            </summary>
            <div className="absolute right-0 top-8 z-10 min-w-32 rounded-lg border border-taskly-strong bg-taskly-surface p-1 shadow-xl shadow-black/40">
              {canEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="flex w-full cursor-pointer items-center gap-2 whitespace-nowrap rounded px-2 py-2 text-left text-xs text-taskly-foreground hover:bg-taskly-surface-muted"
                >
                  <Pencil size={13} aria-hidden="true" /> Edit
                </button>
              )}
              {canManage && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="flex w-full cursor-pointer items-center gap-2 whitespace-nowrap rounded px-2 py-2 text-left text-xs text-taskly-danger hover:bg-red-500/10"
                >
                  <Trash2 size={13} aria-hidden="true" /> Delete
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
            <TaskCard
              key={task.id}
              task={task}
              onOpen={() => onTaskOpen(task)}
            />
          ))}
          {column.tasks.length === 0 && (
            <p className="rounded-lg border border-dashed border-taskly-strong px-3 py-6 text-center text-xs text-taskly-subtle">
              No tasks yet
            </p>
          )}
        </div>
      </SortableContext>
      {canEdit && (
        <Button
          variant="ghost"
          className="m-2 justify-start"
          onClick={onAddTask}
        >
          <Plus size={15} aria-hidden="true" /> Add task
        </Button>
      )}
    </section>
  );
};
