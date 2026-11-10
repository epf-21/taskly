import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui";
import { cn } from "@/utils/cn";
import type { Task, TaskPriority } from "../tasks.type";

const priorityTone: Record<TaskPriority, "blue" | "green" | "amber" | "red"> = {
  low: "blue",
  medium: "green",
  high: "amber",
  urgent: "red",
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
        "cursor-grab rounded-lg border border-taskly-strong bg-taskly-surface p-3 transition-colors hover:border-brand-500/50 active:cursor-grabbing",
        isDragging && "opacity-50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium leading-snug text-taskly-foreground">
          {task.title}
        </p>
        <Badge tone={priorityTone[task.priority]}>{task.priority}</Badge>
      </div>
      {task.description && (
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-taskly-muted">
          {task.description}
        </p>
      )}
      {task.dueDate && (
        <p className="mt-3 text-xs text-taskly-subtle">
          Due {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};
