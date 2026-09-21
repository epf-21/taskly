import { useForm } from "@tanstack/react-form";
import type { BoardColumn } from "../columns.type";
import { Button, Input, InputMessageErrors, Modal } from "@/components/ui";
import { ColumnSchema } from "../dto/column-dto";

export const ColumnModal = ({
  value,
  onClose,
  onSubmit,
}: {
  value: BoardColumn | "new" | null;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}) => {
  const form = useForm({
    defaultValues: { name: value !== "new" && value ? value.name : "" },
    validators: { onSubmit: ColumnSchema },
    onSubmit: async ({ value: values }) => onSubmit(values.name.trim()),
  });
  return (
    <Modal
      open={Boolean(value)}
      title={value === "new" ? "Create column" : "Edit column"}
      onClose={onClose}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field
          name="name"
          children={(field) => (
            <div className="space-y-0.5">
              <Input
                autoFocus
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="Column name"
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
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
};
