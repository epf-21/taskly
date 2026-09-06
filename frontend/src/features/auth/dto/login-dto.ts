import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email("Invalid email address").nonempty("Email is required"),
  password: z.string().nonempty("Password is required"),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const defaultValues = {
  email: "",
  password: "",
};
