import { z } from "zod";

// Database model type (what comes from Prisma)
export interface CategoryModel {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Request input types
export interface CreateCategoryRequest {
  name: string;
  slug?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
}

// Response types
export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  imageUrl: string | null;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryListResponse {
  categories: CategoryResponse[];
  total: number;
}

export interface SingleCategoryResponse {
  category: CategoryResponse;
}

// Service types
export interface CategoryServiceResponse {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  imageUrl: string | null;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// API response wrapper types
export interface ApiSuccessResponse<T> {
  message?: string;
  data?: T;
  [key: string]: any;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  errors?: Array<{ path: string; message: string }>;
}

// File upload types
export interface FileUploadRequest {
  file: Express.Multer.File;
  categoryId: string;
}

export interface CategoryImageResponse {
  imagePath: string;
  imageUrl: string;
}

// Validation input types (from Zod)
export type CreateCategoryInput = z.infer<typeof import("../validators/category").createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof import("../validators/category").updateCategorySchema>;
