import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  .regex(/[0-9]/, "Password must contain at least one number.")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one symbol.");

export const registerUserSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters long."),
    email: z
      .email("Enter a valid email address.")
      .transform((value) => value.toLowerCase()),
    phone: z.string().trim().optional().or(z.literal("")),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const registerOrganizerSchema = registerUserSchema.extend({
  organizationName: z
    .string()
    .min(2, "Organization name must be at least 2 characters long."),
  contactPerson: z.string().trim().optional().or(z.literal("")),
  websiteUrl: z.url("Enter a valid website URL.").optional().or(z.literal("")),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long."),
  address: z.string().min(5, "Address must be at least 5 characters long."),
});

export const loginSchema = z.object({
  email: z
    .email("Enter a valid email address.")
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Password is required."),
});
