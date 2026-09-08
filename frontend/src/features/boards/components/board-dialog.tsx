import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Button, Modal, Input, Textarea } from "@/components/ui";
import { getApiErrorMessage } from "@/lib/api/errors";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { name: string; description?: string }) => Promise<void>;
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
    defaultValues: initialValues ?? { name: "", description: "" },
    onSubmit: async ({ value }) => {
      try {
        await onSubmit({
          name: value.name.trim(),
          description: value.description.trim() || undefined,
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
          void form.handleSubmit();
        }}
      >
        <form.Field name="name">
          {(field) => (
            <label className="block space-y-2">
              <span className="text-sm font-medium text-taskly-foreground">
                Name
              </span>
              <Input
                required
                minLength={2}
                maxLength={255}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </label>
          )}
        </form.Field>
        <form.Field name="description">
          {(field) => (
            <label className="block space-y-2">
              <span className="text-sm font-medium text-taskly-foreground">
                Description
              </span>
              <Textarea
                maxLength={1000}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </label>
          )}
        </form.Field>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <form.Subscribe selector={(state) => [state.isSubmitting]}>
            {([isSubmitting]) => (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save board"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  );
};
