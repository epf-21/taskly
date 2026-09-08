import { z } from "zod";

export const RegisterSchema = z.object({
  fullName: z
    .string()
    .min(5, "Full name must be at least 5 characters long")
    .max(100, "Full name must be at most 100 characters long"),

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
