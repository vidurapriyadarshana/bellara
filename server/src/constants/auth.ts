// Authentication error messages
export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Invalid email or password",
  EMAIL_PASSWORD_REQUIRED: "Email and password are required",
  UNAUTHORIZED: "Unauthorized access",
  ADMIN_NOT_FOUND: "Admin not found",
  CURRENT_PASSWORD_REQUIRED: "Current password is required to set a new password",
  INCORRECT_PASSWORD: "Current password is incorrect",
  INVALID_NAME: "Name cannot be empty",
  INVALID_NEW_PASSWORD: "New password must be at least 6 characters",
  NO_FIELDS_TO_UPDATE: "No valid fields to update",
  INTERNAL_ERROR: "Internal Server Error",
} as const;

// Authentication success messages
export const AUTH_SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logout successful",
  PROFILE_FETCHED: "Profile fetched successfully",
  PROFILE_UPDATED: "Profile updated successfully",
} as const;

// HTTP Status Codes
export enum AuthHttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

// Password constraints
export const PASSWORD_CONSTRAINTS = {
  MIN_LENGTH: 6,
  BCRYPT_ROUNDS: 12,
} as const;

// Admin name constraints
export const ADMIN_CONSTRAINTS = {
  NAME: {
    MIN: 1,
    MAX: 100,
  },
  EMAIL: {
    MIN: 5,
    MAX: 255,
  },
} as const;

// JWT configuration
export const JWT_CONFIG = {
  EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  SECRET: process.env.JWT_SECRET || "your-secret-key",
  COOKIE_NAME: "authToken",
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  },
} as const;
