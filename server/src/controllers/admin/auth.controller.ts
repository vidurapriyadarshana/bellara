import { Request, Response } from "express";
import authService from "../../services/auth.service";
import { loginSchema, updateProfileSchema } from "../../validators/auth";
import {
  AUTH_ERROR_MESSAGES,
  AUTH_SUCCESS_MESSAGES,
  AuthHttpStatus,
  JWT_CONFIG,
} from "../../constants/auth";

/**
 * Admin Authentication Controller
 * Handles admin authentication operations
 */
class AuthController {
  /**
   * Admin login
   * POST /api/admin/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const parseResult = loginSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(AuthHttpStatus.BAD_REQUEST).json({
          error: "Validation Error",
          message: parseResult.error.issues[0].message,
          errors: parseResult.error.issues,
        });
        return;
      }

      try {
        const { admin, token } = await authService.login(parseResult.data);

        // Set HTTP-only cookie
        res.cookie(JWT_CONFIG.COOKIE_NAME, token, JWT_CONFIG.COOKIE_OPTIONS);

        res.json({
          message: AUTH_SUCCESS_MESSAGES.LOGIN_SUCCESS,
          admin,
          token, // Also return token for clients that prefer header auth
        });
      } catch (error: any) {
        if (error.message === AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS) {
          res.status(AuthHttpStatus.UNAUTHORIZED).json({
            error: "Unauthorized",
            message: error.message,
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(AuthHttpStatus.INTERNAL_SERVER_ERROR).json({
        error: AUTH_ERROR_MESSAGES.INTERNAL_ERROR,
        message: "Login failed",
      });
    }
  }

  /**
   * Admin logout
   * POST /api/admin/logout
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie(JWT_CONFIG.COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      res.json({
        message: AUTH_SUCCESS_MESSAGES.LOGOUT_SUCCESS,
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(AuthHttpStatus.INTERNAL_SERVER_ERROR).json({
        error: AUTH_ERROR_MESSAGES.INTERNAL_ERROR,
        message: "Logout failed",
      });
    }
  }

  /**
   * Get current admin profile
   * GET /api/admin/me
   */
  async getCurrentAdmin(req: Request, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        res.status(AuthHttpStatus.UNAUTHORIZED).json({
          error: "Unauthorized",
          message: AUTH_ERROR_MESSAGES.UNAUTHORIZED,
        });
        return;
      }

      res.json({
        message: AUTH_SUCCESS_MESSAGES.PROFILE_FETCHED,
        admin: req.admin,
      });
    } catch (error) {
      console.error("Get current admin error:", error);
      res.status(AuthHttpStatus.INTERNAL_SERVER_ERROR).json({
        error: AUTH_ERROR_MESSAGES.INTERNAL_ERROR,
        message: "Failed to fetch profile",
      });
    }
  }

  /**
   * Update admin profile
   * PATCH /api/admin/me
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        res.status(AuthHttpStatus.UNAUTHORIZED).json({
          error: "Unauthorized",
          message: AUTH_ERROR_MESSAGES.UNAUTHORIZED,
        });
        return;
      }

      // Validate input
      const parseResult = updateProfileSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(AuthHttpStatus.BAD_REQUEST).json({
          error: "Validation Error",
          message: parseResult.error.issues[0].message,
          errors: parseResult.error.issues,
        });
        return;
      }

      try {
        const admin = await authService.updateProfile(
          req.admin.id,
          parseResult.data
        );

        res.json({
          message: AUTH_SUCCESS_MESSAGES.PROFILE_UPDATED,
          admin,
        });
      } catch (error: any) {
        if (
          error.message === AUTH_ERROR_MESSAGES.ADMIN_NOT_FOUND ||
          error.message === AUTH_ERROR_MESSAGES.INVALID_NAME ||
          error.message === AUTH_ERROR_MESSAGES.CURRENT_PASSWORD_REQUIRED ||
          error.message === AUTH_ERROR_MESSAGES.INCORRECT_PASSWORD ||
          error.message === AUTH_ERROR_MESSAGES.INVALID_NEW_PASSWORD ||
          error.message === AUTH_ERROR_MESSAGES.NO_FIELDS_TO_UPDATE
        ) {
          const statusCode =
            error.message === AUTH_ERROR_MESSAGES.ADMIN_NOT_FOUND
              ? AuthHttpStatus.NOT_FOUND
              : error.message === AUTH_ERROR_MESSAGES.INCORRECT_PASSWORD
              ? AuthHttpStatus.UNAUTHORIZED
              : AuthHttpStatus.BAD_REQUEST;

          res.status(statusCode).json({
            error:
              statusCode === AuthHttpStatus.NOT_FOUND
                ? "Not Found"
                : statusCode === AuthHttpStatus.UNAUTHORIZED
                ? "Unauthorized"
                : "Bad Request",
            message: error.message,
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(AuthHttpStatus.INTERNAL_SERVER_ERROR).json({
        error: AUTH_ERROR_MESSAGES.INTERNAL_ERROR,
        message: "Failed to update profile",
      });
    }
  }
}

// Export singleton instance
export default new AuthController();
