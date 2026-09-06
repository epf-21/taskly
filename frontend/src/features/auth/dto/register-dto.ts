import { z } from "zod";

export const RegisterSchema = z.object({
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters long")
    .max(20, "Full name must be at most 20 characters long")
    .regex(
      /^[a-zA-Z0-9_/-]+$/,
      "Only letters, numbers, hyphens and underscores",
    ),
  email: z.email("Invalid email address").nonempty("Email is required"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/,
      "Debe incluir mayúscula, minúscula, número y carácter especial",
    ),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;

export const defaultValues = {
  fullName: "",
  email: "",
  password: "",
};
