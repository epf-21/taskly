import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays } from "lucide-react";
import { cn } from "@/utils/cn";
import type { Task, TaskPriority } from "../tasks.type";

const priorityDot: Record<TaskPriority, string> = {
  low: "bg-info",
  medium: "bg-success",
  high: "bg-warning",
  urgent: "bg-danger",
};

export const TaskCard = ({
  task,
  onOpen,
}: {
  task: Task;
  onOpen?: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const formattedDue = dueDate?.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      onDoubleClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen?.();
        }
      }}
      className={cn(
        "cursor-grab rounded-lg border border-taskly bg-taskly-surface p-3 transition-colors hover:border-taskly-strong active:cursor-grabbing",
        isDragging && "opacity-50",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium leading-snug text-taskly-foreground">
          {task.title}
        </p>
        <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-taskly-subtle">
          <span
            className={cn("h-1.5 w-1.5 rounded-full", priorityDot[task.priority])}
            aria-hidden="true"
          />
          <span className="sr-only">Priority: </span>
          {task.priority}
        </span>
      </div>
      {task.description && (
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-taskly-muted">
          {task.description}
        </p>
      )}
      {formattedDue && (
        <p className="mt-2.5 inline-flex items-center gap-1 text-[11px] text-taskly-subtle">
          <CalendarDays size={12} aria-hidden="true" />
          Due {formattedDue}
        </p>
      )}
    </div>
  );
};
