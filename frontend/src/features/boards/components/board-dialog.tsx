import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import {
  Button,
  Modal,
  Input,
  Textarea,
  InputMessageErrors,
} from "@/components/ui";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  BoardCreateSchema,
  defaultValues,
  type BoardCreateDto,
} from "../dto/board-dto";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: BoardCreateDto) => Promise<void>;
  initialValues?: { name: string; description: string };
  title: string;
}

export const BoardDialog = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  title,
}: Props) => {
  const form = useForm({
    defaultValues: initialValues ?? defaultValues,
    validators: { onSubmit: BoardCreateSchema },
    onSubmit: async ({ value }) => {
      try {
        await onSubmit({
          name: value.name.trim(),
          description: value.description?.trim() ?? "",
        });
        toast.success("Board saved");
        onClose();
        form.reset();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Unable to save board"));
      }
    },
  });

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          form.handleSubmit();
        }}
      >
        <form.Field
          name="name"
          children={(field) => (
            <div className="flex flex-col gap-2 space-y-2">
              <label
                htmlFor={field.name}
                className="flex flex-wrap text-sm font-medium text-taskly-foreground"
              >
                <span>Name</span>
              </label>
              <Input
                type="text"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
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
            <div className="flex flex-col gap-2 space-y-2">
              <label className="flex flez-wrap text-sm font-medium text-taskly-foreground">
                <span>Description</span>
              </label>
              <Textarea
                maxLength={1000}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
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
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? "Saving..." : "Save workspace"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  );
};
