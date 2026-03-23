import { z } from "zod";

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .min(5, "Email must be at least 5 characters")
    .max(255, "Email must be less than 255 characters")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

// Update profile validation schema
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Name cannot be empty")
    .max(100, "Name must be less than 100 characters")
    .trim()
    .optional(),
  currentPassword: z
    .string()
    .min(1, "Current password is required")
    .optional(),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters")
    .optional(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
