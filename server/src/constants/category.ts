// Category validation constants
export const CATEGORY_CONSTRAINTS = {
  NAME: {
    MIN: 1,
    MAX: 100,
  },
  SLUG: {
    MIN: 1,
    MAX: 100,
  },
} as const;

// Category error messages
export const CATEGORY_ERROR_MESSAGES = {
  NOT_FOUND: "Category not found",
  INVALID_NAME: "Category name must be between 1 and 100 characters",
  INVALID_SLUG: "Slug can only contain lowercase letters, numbers, and hyphens",
  DUPLICATE_SLUG: "A category with this slug already exists",
  HAS_PRODUCTS: "Cannot delete category with products. Move or delete products first.",
  NO_IMAGE: "Category has no image to delete",
  NO_FILE_PROVIDED: "No image file provided",
  IMAGE_UPLOAD_FAILED: "Failed to upload category image",
  INVALID_INPUT: "Invalid input provided",
  NO_FIELDS_TO_UPDATE: "No valid fields to update",
  UNAUTHORIZED: "Unauthorized access",
  INTERNAL_ERROR: "Internal Server Error",
} as const;

// Category success messages
export const CATEGORY_SUCCESS_MESSAGES = {
  CREATED: "Category created successfully",
  UPDATED: "Category updated successfully",
  DELETED: "Category deleted successfully",
  IMAGE_UPLOADED: "Category image uploaded successfully",
  IMAGE_DELETED: "Category image deleted successfully",
  FETCHED: "Category fetched successfully",
  LISTED: "Categories listed successfully",
} as const;

// HTTP Status Codes
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

// Category sort options
export enum CategorySortBy {
  NAME_ASC = "name_asc",
  NAME_DESC = "name_desc",
  CREATED_ASC = "created_asc",
  CREATED_DESC = "created_desc",
  UPDATED_ASC = "updated_asc",
  UPDATED_DESC = "updated_desc",
}

// File upload constants
export const FILE_UPLOAD_CONSTANTS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FORMATS: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  UPLOAD_DIR: "categories",
} as const;

// Pagination defaults (for future use)
export const PAGINATION_DEFAULTS = {
  LIMIT: 10,
  OFFSET: 0,
} as const;

export const CATEGORY_VALIDATION_RULES = {
  SLUG_REGEX: /^[a-z0-9-]*$/,
  SLUG_REGEX_UPDATE: /^[a-z0-9-]+$/,
} as const;
