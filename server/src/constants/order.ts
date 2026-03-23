// Order error and success messages
export const ORDER_MESSAGES = {
  // Success messages
  CREATED_SUCCESS: "Order created successfully",
  RETRIEVED_SUCCESS: "Order retrieved successfully",
  STATUS_UPDATED_SUCCESS: "Order status updated successfully",
  TRACKING_UPDATED_SUCCESS: "Tracking information updated successfully",
  PAYMENT_PROOF_UPLOADED_SUCCESS: "Payment proof uploaded successfully",
  LISTED_SUCCESS: "Orders listed successfully",

  // Error messages
  INVALID_REQUEST: "Invalid order request data",
  INVALID_PAYMENT_METHOD: "Invalid payment method",
  INVALID_CUSTOMER_DATA: "Invalid customer data",
  INVALID_BILLING_DATA: "Invalid billing data",
  CART_EMPTY: "Cart cannot be empty",
  PRODUCT_NOT_FOUND: "One or more products not found",
  INSUFFICIENT_STOCK: "Insufficient stock for product",
  PRODUCT_INACTIVE: "One or more products are not available",
  ORDER_NOT_FOUND: "Order not found",
  INVALID_ORDER_NUMBER: "Invalid order number format",
  INVALID_STATUS: "Invalid order status",
  INVALID_PAGINATION: "Invalid pagination parameters",
   FAILED_TO_CREATE: "Failed to create order",
   FAILED_TO_RETRIEVE: "Failed to retrieve order",
   FAILED_TO_UPDATE_STATUS: "Failed to update order status",
   FAILED_TO_UPLOAD_PROOF: "Failed to upload payment proof",
   FAILED_TO_UPLOAD_PAYMENT_PROOF: "Failed to upload payment proof",
   FAILED_TO_LIST: "Failed to list orders",
  UNAUTHORIZED: "Unauthorized access",
  RATE_LIMIT_EXCEEDED: "Too many order creation attempts. Please try again later.",

  // Payment proof specific errors
  NO_FILE_PROVIDED: "No payment proof file provided",
  INVALID_FILE_TYPE: "Invalid file type. Only images and PDF are allowed",
  FILE_TOO_LARGE: "File size exceeds maximum limit (5MB)",
  PROOF_ALREADY_UPLOADED: "Payment proof already uploaded for this order",
  INVALID_PAYMENT_PROOF_DATA: "Invalid payment proof data",
  INVALID_TRANSFER_DATE: "Invalid transfer date format",
  AMOUNT_MISMATCH: "Payment amount does not match order total",
  PAYMENT_METHOD_REQUIRES_PROOF: "Payment proof is required for bank transfer orders",
};


// HTTP Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

// Order configuration
export const ORDER_CONFIG = {
  // Shipping fee in LKR (Sri Lankan Rupees)
  SHIPPING_FEE: 500,

  // Order number format: BLR-YYYYMMDD-XXX
  // XXX = auto-incremented sequence per day (001, 002, 003, etc.)
  ORDER_NUMBER_PREFIX: "BLR",
  ORDER_NUMBER_DATE_FORMAT: "YYYYMMDD",

  // Pagination defaults and limits
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,

  // Rate limiting
  CREATE_ORDER_RATE_LIMIT: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // Max 5 orders per minute per IP
  },

  // Order item constraints
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 100,

  // Payment proof constraints
  PAYMENT_PROOF: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "image/gif", "application/pdf"],
    UPLOAD_DIR: "receipts",
  },

  // Valid order status transitions
  STATUS_TRANSITIONS: {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["PROCESSING", "CANCELLED"],
    PROCESSING: ["PACKAGED", "CANCELLED"],
    PACKAGED: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["DELIVERED", "CANCELLED"],
    DELIVERED: [],
    CANCELLED: [],
  },
};

// Payment method display names
export const PAYMENT_METHOD_NAMES = {
  CASH_ON_DELIVERY: "Cash on Delivery (COD)",
  BANK_TRANSFER: "Bank Transfer",
};

// Order status display names
export const ORDER_STATUS_NAMES = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  PACKAGED: "Packaged",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

// Payment status display names
export const PAYMENT_STATUS_NAMES = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};
