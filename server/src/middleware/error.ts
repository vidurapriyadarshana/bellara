import { Request, Response, NextFunction } from "express";

// Custom API Error class
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Common error factory functions
export const BadRequestError = (message = "Bad Request") => new ApiError(400, message);
export const UnauthorizedError = (message = "Unauthorized") => new ApiError(401, message);
export const ForbiddenError = (message = "Forbidden") => new ApiError(403, message);
export const NotFoundError = (message = "Not Found") => new ApiError(404, message);
export const ConflictError = (message = "Conflict") => new ApiError(409, message);
export const InternalError = (message = "Internal Server Error") => new ApiError(500, message, false);

// 404 handler for unknown routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  next(new ApiError(404, `Route ${req.method} ${req.path} not found`));
};

// Global error handler
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let message = "Internal Server Error";
  let isOperational = false;

  // Handle ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } else if (err instanceof SyntaxError && "body" in err) {
    // JSON parse error
    statusCode = 400;
    message = "Invalid JSON in request body";
    isOperational = true;
  }

  // Log error (only log stack for non-operational errors in production)
  if (!isOperational || process.env.NODE_ENV !== "production") {
    console.error(`[${new Date().toISOString()}] Error:`, {
      statusCode,
      message,
      path: req.path,
      method: req.method,
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    });
  }

  // Send error response
  res.status(statusCode).json({
    error: getErrorTitle(statusCode),
    message,
    ...(process.env.NODE_ENV !== "production" && !isOperational && { stack: err.stack }),
  });
};

// Get error title from status code
const getErrorTitle = (statusCode: number): string => {
  const titles: Record<number, string> = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    409: "Conflict",
    422: "Unprocessable Entity",
    429: "Too Many Requests",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
  };
  return titles[statusCode] || "Error";
};

// Async handler wrapper to catch errors in async route handlers
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
