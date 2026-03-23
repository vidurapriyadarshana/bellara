import { z } from "zod";
import { PRODUCT_IMAGE_CONSTRAINTS } from "@/constants/product-image";

export const reorderImagesSchema = z.object({
  imageIds: z
    .array(
      z.object({
        id: z.string().uuid("Invalid image ID"),
        sortOrder: z.number().int().min(0, "Sort order must be non-negative"),
      })
    )
    .min(1, "At least one image is required")
    .refine(
      (arr) => new Set(arr.map((x) => x.id)).size === arr.length,
      "Duplicate image IDs found"
    ),
});

export const setPrimaryImageSchema = z.object({
  imageId: z.string().uuid("Invalid image ID"),
});

export type ReorderImagesInput = z.infer<typeof reorderImagesSchema>;
export type SetPrimaryImageInput = z.infer<typeof setPrimaryImageSchema>;
