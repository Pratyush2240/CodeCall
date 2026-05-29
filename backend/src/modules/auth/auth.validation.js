import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100)
      .optional(),

    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be at most 30 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),

    email: z
      .string()
      .email("Email must be valid"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),

    confirmPassword: z
      .string()
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
});

export const loginSchema = z.object({
  body: z.object({
    identifier: z
      .string()
      .min(3, "Email or username is required"),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
  })
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Email must be valid")
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z
      .string()
      .min(1, "Reset token is required"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),

    confirmPassword: z
      .string()
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
});
