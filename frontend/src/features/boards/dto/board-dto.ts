import { z } from "zod";

export const BoardCreateSchema = z.object({
  name: z
    .string()
    .nonempty("the name board is required")
    .min(3, "the minimum size is 3")
    .max(50, "the maximum size is 50"),
  description: z.string().max(500, "the maximum size is 500").optional(),
});

export type BoardCreateDto = z.infer<typeof BoardCreateSchema>;

export const defaultValues: BoardCreateDto = {
  name: "",
  description: "",
};
