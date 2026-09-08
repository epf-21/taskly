import { z } from "zod";

export const WorkspaceCreateSchema = z.object({
  name: z
    .string()
    .nonempty("the name workspace is required")
    .min(3, "the minimum size is 3")
    .max(50, "the maximum size is 50"),
  description: z.string().max(500, "the maximum size is 500").optional(),
});

export type WorkspaceCreateDto = z.infer<typeof WorkspaceCreateSchema>;

export const defaultValues: WorkspaceCreateDto = {
  name: "",
  description: "",
};
