import { Request, Response, NextFunction } from "express";
import { verifyToken, AUTH_COOKIE_NAME, DecodedToken } from "../lib/jwt";
import prisma from "../lib/prisma";
import { Admin } from "@prisma/client";

// Extend Express Request to include admin
declare global {
  namespace Express {
    interface Request {
      admin?: Omit<Admin, "password">;
      adminToken?: DecodedToken;
    }
  }
}

/**
 * Middleware to require admin authentication
 * Checks for JWT token in cookies or Authorization header
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from cookie or Authorization header
    let token = req.cookies?.[AUTH_COOKIE_NAME];

    // Fallback to Authorization header (Bearer token)
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or expired token",
      });
      return;
    }

    // Get admin from database
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Admin not found",
      });
      return;
    }

    // Attach admin and token to request
    req.admin = admin;
    req.adminToken = decoded;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Authentication failed",
    });
  }
};

/**
 * Optional auth middleware - attaches admin if token present, but doesn't require it
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = req.cookies?.[AUTH_COOKIE_NAME];

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        const admin = await prisma.admin.findUnique({
          where: { id: decoded.adminId },
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        if (admin) {
          req.admin = admin;
          req.adminToken = decoded;
        }
      }
    }

    next();
  } catch {
    // Silently continue without auth
    next();
  }
};
