import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Email must be valid"),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters"),

    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Email must be valid"),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
  })
});
