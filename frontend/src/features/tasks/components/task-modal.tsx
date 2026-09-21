import { useForm } from "@tanstack/react-form";
import type { CreateTask, TaskPriority } from "../tasks.type";
import { Button, Input, InputMessageErrors, Modal } from "@/components/ui";
import { defaultValues, TaskSchema } from "../dto/task-dto";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTask) => Promise<void>;
}

export const TaskModal = ({ open, onClose, onSubmit }: Props) => {
  const form = useForm({
    defaultValues,
    validators: { onSubmit: TaskSchema },
    onSubmit: async ({ value }) =>
      onSubmit({
        ...value,
        title: value.title.trim(),
        description: value.description?.trim() ?? "",
      }),
  });
  return (
    <Modal open={open} title="Create task" onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field
          name="title"
          children={(field) => (
            <div className="space-y-0.5">
              <Input
                autoFocus
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="Task title"
              />
              {!field.state.meta.isValid && (
                <InputMessageErrors
                  message={field.state.meta.errors
                    .map((e) => e?.message)
                    .join(" ")}
                />
              )}
            </div>
          )}
        />
        <form.Field
          name="description"
          children={(field) => (
            <div className="spcae-y-0.5">
              <textarea
                className="min-h-24 w-full rounded-lg border border-taskly bg-taskly-surface-muted p-3 text-sm text-taskly-foreground outline-none"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="Description (optional)"
              />
              {!field.state.meta.isValid && (
                <InputMessageErrors
                  message={field.state.meta.errors
                    .map((e) => e?.message)
                    .join(" ")}
                />
              )}
            </div>
          )}
        />
        <form.Field
          name="priority"
          children={(field) => (
            <div className="space-y-0.5">
              <select
                className="w-full rounded-lg border border-taskly bg-taskly-surface-muted p-3 text-sm text-taskly-foreground"
                value={field.state.value}
                onChange={(event) =>
                  field.handleChange(event.target.value as TaskPriority)
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              {!field.state.meta.isValid && (
                <InputMessageErrors
                  message={field.state.meta.errors
                    .map((e) => e?.message)
                    .join(" ")}
                />
              )}
            </div>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create task</Button>
        </div>
      </form>
    </Modal>
  );
};
