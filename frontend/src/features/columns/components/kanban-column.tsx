import { useDroppable } from "@dnd-kit/core";
import type { BoardColumn } from "../columns.type";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/utils/cn";
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
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const count = column.tasks.length;
  const overLimit = column.wipLimit != null && count > column.wipLimit;

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex w-[19rem] min-w-[19rem] flex-col rounded-xl border bg-taskly-surface-muted transition-colors",
        isOver ? "border-brand-500/50 bg-taskly-surface" : "border-taskly",
      )}
    >
      <div className="flex items-start justify-between gap-2 border-b border-taskly px-3.5 py-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-taskly-foreground">
            {column.name}
          </h3>
          <p
            className={cn(
              "mt-0.5 text-[11px] tabular-nums",
              overLimit ? "text-taskly-danger" : "text-taskly-subtle",
            )}
          >
            {count} {count === 1 ? "task" : "tasks"}
            {column.wipLimit != null && ` / ${column.wipLimit}`}
          </p>
        </div>
        {(canManage || canEdit) && (
          <details className="relative -mr-1">
            <summary
              className="flex h-7 w-7 cursor-pointer list-none items-center justify-center rounded-md text-taskly-subtle transition-colors hover:bg-taskly-surface hover:text-taskly-foreground"
              aria-label={`Column actions for ${column.name}`}
            >
              <MoreHorizontal size={16} aria-hidden="true" />
            </summary>
            <div className="absolute right-0 top-8 z-20 min-w-36 rounded-lg border border-taskly-strong bg-taskly-surface p-1 shadow-xl shadow-black/40">
              {canEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="flex w-full cursor-pointer items-center gap-2 whitespace-nowrap rounded-md px-2 py-1.5 text-left text-xs text-taskly-foreground hover:bg-taskly-surface-muted"
                >
                  <Pencil size={13} aria-hidden="true" /> Edit
                </button>
              )}
              {canManage && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="flex w-full cursor-pointer items-center gap-2 whitespace-nowrap rounded-md px-2 py-1.5 text-left text-xs text-taskly-danger hover:bg-danger/10"
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
        <div className="flex flex-1 flex-col gap-2 p-2.5">
          {column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onOpen={() => onTaskOpen(task)}
            />
          ))}
          {count === 0 && (
            <p className="rounded-lg border border-dashed border-taskly-strong/70 px-3 py-6 text-center text-[11px] text-taskly-subtle">
              No tasks yet
            </p>
          )}
        </div>
      </SortableContext>
      {canEdit && (
        <button
          type="button"
          onClick={onAddTask}
          className="mx-2 mb-2 flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-taskly-muted transition-colors hover:bg-taskly-surface hover:text-taskly-foreground"
        >
          <Plus size={14} aria-hidden="true" /> Add task
        </button>
      )}
    </section>
  );
};
