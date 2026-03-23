// Product image constants - error messages, success messages, and constraints

export const PRODUCT_IMAGE_CONSTRAINTS = {
  MAX_IMAGES_PER_PRODUCT: 10,
  MIN_FILE_SIZE: 100, // bytes
  MAX_FILE_SIZE: 5242880, // 5MB
  ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp"],
} as const;

export const PRODUCT_IMAGE_MESSAGES = {
  // Success messages
  UPLOADED_SUCCESS: "Product images uploaded successfully",
  DELETED_SUCCESS: "Product image deleted successfully",
  PRIMARY_SET_SUCCESS: "Primary image set successfully",
  REORDERED_SUCCESS: "Image order updated successfully",

  // Error messages
  NOT_FOUND: "Product image not found",
  PRODUCT_NOT_FOUND: "Product not found",
  NO_FILES_PROVIDED: "No files provided for upload",
  INVALID_FILE_TYPE: "Invalid file type. Allowed: JPEG, PNG, WebP",
  FILE_TOO_LARGE: "File size exceeds maximum limit (5MB)",
  FILE_TOO_SMALL: "File size too small",
  MAX_IMAGES_EXCEEDED: `Maximum ${PRODUCT_IMAGE_CONSTRAINTS.MAX_IMAGES_PER_PRODUCT} images per product allowed`,
  INVALID_IMAGE_ID: "Invalid image ID provided",
  MISSING_IMAGE_IDS: "Image IDs are required for reordering",
  CANNOT_DELETE_ONLY_IMAGE: "Cannot delete the only image of a product",
  FAILED_TO_SAVE_FILE: "Failed to save image file",
  FAILED_TO_DELETE_FILE: "Failed to delete image file",
  DUPLICATE_IMAGE_ID: "Duplicate image ID in request",
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
} as const;
