// Product constants - error messages, success messages, and validation constraints

export const PRODUCT_CONSTRAINTS = {
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 255,
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 5000,
  PRICE_MIN: 0,
  PRICE_MAX: 999999.99,
  STOCK_MIN: 0,
  STOCK_MAX: 999999,
  SLUG_PATTERN: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const;

export const PRODUCT_MESSAGES = {
  // Success messages
  CREATED_SUCCESS: "Product created successfully",
  UPDATED_SUCCESS: "Product updated successfully",
  DELETED_SUCCESS: "Product deleted successfully",
  LISTED_SUCCESS: "Products retrieved successfully",
  RETRIEVED_SUCCESS: "Product retrieved successfully",

  // Error messages
  NOT_FOUND: "Product not found",
  CATEGORY_NOT_FOUND: "Category not found",
  NAME_REQUIRED: "Product name is required",
  DESCRIPTION_REQUIRED: "Product description is required",
  PRICE_REQUIRED: "Product price is required",
  CATEGORY_ID_REQUIRED: "Category ID is required",
  STOCK_REQUIRED: "Stock quantity is required",
  SLUG_EXISTS: "A product with this name already exists",
  INVALID_PRICE: "Price must be a positive number",
  INVALID_STOCK: "Stock must be a non-negative number",
  INVALID_CATEGORY: "Invalid category ID",
  DUPLICATE_SLUG: "Product slug already exists",
  CANNOT_DELETE_WITH_ORDERS:
    "Cannot delete product that has orders associated with it",
  INVALID_PAGINATION: "Invalid page or limit parameters",
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
} as const;

export const PRODUCT_STATUS = {
  ACTIVE: true,
  INACTIVE: false,
} as const;

export const PAGINATION_DEFAULTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;
