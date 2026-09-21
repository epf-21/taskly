import { z } from "zod";

export const ColumnSchema = z.object({
  name: z
    .string()
    .nonempty("the title column is required")
    .max(100, "Column name must be at most 100 characters long"),
});
