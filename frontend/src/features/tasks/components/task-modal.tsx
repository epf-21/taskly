import { useForm } from "@tanstack/react-form";
import type { CreateTask, TaskPriority } from "../tasks.type";
import {
  Button,
  Input,
  InputMessageErrors,
  Modal,
  Textarea,
} from "@/components/ui";
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
          children={(field) => {
            const invalid = !field.state.meta.isValid;
            return (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium text-taskly-foreground"
                >
                  Title
                </label>
                <Input
                  id={field.name}
                  autoFocus
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="What needs to be done?"
                  aria-invalid={invalid}
                  aria-describedby={invalid ? `${field.name}-error` : undefined}
                />
                {invalid && (
                  <InputMessageErrors
                    id={`${field.name}-error`}
                    message={field.state.meta.errors
                      .map((e) => e?.message)
                      .join(" ")}
                  />
                )}
              </div>
            );
          }}
        />
        <form.Field
          name="description"
          children={(field) => (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={field.name}
                className="text-sm font-medium text-taskly-foreground"
              >
                Description
                <span className="ml-1 text-xs font-normal text-taskly-subtle">
                  (optional)
                </span>
              </label>
              <Textarea
                id={field.name}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                placeholder="Add context, links, or acceptance criteria"
              />
            </div>
          )}
        />
        <form.Field
          name="priority"
          children={(field) => (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={field.name}
                className="text-sm font-medium text-taskly-foreground"
              >
                Priority
              </label>
              <select
                id={field.name}
                className="min-h-11 rounded-lg border border-taskly-strong bg-taskly-surface-muted px-3 text-sm text-taskly-foreground outline-none focus:border-brand-400"
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
            </div>
          )}
        />
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create task</Button>
        </div>
      </form>
    </Modal>
  );
};
