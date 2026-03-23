import { z } from "zod";

// Create category schema
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  slug: z
    .string()
    .max(100, "Slug must be less than 100 characters")
    .regex(/^[a-z0-9-]*$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .optional(),
});

// Update category schema (all fields optional)
export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Name cannot be empty")
    .max(100, "Name must be less than 100 characters")
    .trim()
    .optional(),
  slug: z
    .string()
    .max(100, "Slug must be less than 100 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .optional(),
});

// Type exports
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
