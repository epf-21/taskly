import { z } from "zod";

export const TaskPrioritySchema = z.enum(
  ["low", "medium", "high", "urgent"],
  "priority must be one of: low, medium, high, urgent",
);

export const TaskSchema = z.object({
  title: z
    .string()
    .nonempty("the title task is required")
    .max(200, "the maximum size is 200"),
  description: z.string().max(500, "the maximum size is 500").optional(),
  priority: TaskPrioritySchema,
});

export type TaskCreateDto = z.infer<typeof TaskSchema>;

export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

export const defaultValues: TaskCreateDto = {
  title: "",
  description: "",
  priority: "medium",
};
