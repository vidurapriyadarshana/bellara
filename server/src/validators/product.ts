import { z } from "zod";
import { PRODUCT_CONSTRAINTS } from "@/constants/product";

export const createProductSchema = z.object({
  categoryId: z
    .string()
    .min(1, "Category ID is required")
    .uuid("Invalid category ID"),
  name: z
    .string()
    .min(
      PRODUCT_CONSTRAINTS.NAME_MIN_LENGTH,
      `Name must be at least ${PRODUCT_CONSTRAINTS.NAME_MIN_LENGTH} characters`
    )
    .max(
      PRODUCT_CONSTRAINTS.NAME_MAX_LENGTH,
      `Name must not exceed ${PRODUCT_CONSTRAINTS.NAME_MAX_LENGTH} characters`
    )
    .trim(),
  description: z
    .string()
    .min(
      PRODUCT_CONSTRAINTS.DESCRIPTION_MIN_LENGTH,
      `Description must be at least ${PRODUCT_CONSTRAINTS.DESCRIPTION_MIN_LENGTH} characters`
    )
    .max(
      PRODUCT_CONSTRAINTS.DESCRIPTION_MAX_LENGTH,
      `Description must not exceed ${PRODUCT_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} characters`
    )
    .trim(),
  price: z
    .number()
    .positive("Price must be a positive number")
    .max(
      PRODUCT_CONSTRAINTS.PRICE_MAX,
      `Price must not exceed ${PRODUCT_CONSTRAINTS.PRICE_MAX}`
    ),
  originalPrice: z
    .number()
    .positive("Original price must be positive")
    .optional(),
  stock: z
    .number()
    .int("Stock must be an integer")
    .min(PRODUCT_CONSTRAINTS.STOCK_MIN, "Stock cannot be negative")
    .max(
      PRODUCT_CONSTRAINTS.STOCK_MAX,
      `Stock must not exceed ${PRODUCT_CONSTRAINTS.STOCK_MAX}`
    ),
  isActive: z.boolean().optional().default(true),
});

export const updateProductSchema = z.object({
  categoryId: z.string().min(1).uuid().optional(),
  name: z
    .string()
    .min(PRODUCT_CONSTRAINTS.NAME_MIN_LENGTH)
    .max(PRODUCT_CONSTRAINTS.NAME_MAX_LENGTH)
    .trim()
    .optional(),
  description: z
    .string()
    .min(PRODUCT_CONSTRAINTS.DESCRIPTION_MIN_LENGTH)
    .max(PRODUCT_CONSTRAINTS.DESCRIPTION_MAX_LENGTH)
    .trim()
    .optional(),
  price: z
    .number()
    .positive()
    .max(PRODUCT_CONSTRAINTS.PRICE_MAX)
    .optional(),
  originalPrice: z.number().positive().optional(),
  stock: z
    .number()
    .int()
    .min(PRODUCT_CONSTRAINTS.STOCK_MIN)
    .max(PRODUCT_CONSTRAINTS.STOCK_MAX)
    .optional(),
  isActive: z.boolean().optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  categoryId: z.string().uuid().optional(),
  search: z.string().trim().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
