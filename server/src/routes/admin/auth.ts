import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma";
import { generateToken, AUTH_COOKIE_NAME, cookieConfig } from "../../lib/jwt";
import { requireAuth } from "../../middleware/auth";

const router = Router();

/**
 * POST /api/admin/login
 * Admin login with email and password
 */
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        error: "Bad Request",
        message: "Email and password are required",
      });
      return;
    }

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!admin) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Invalid email or password",
      });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Invalid email or password",
      });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      adminId: admin.id,
      email: admin.email,
    });

    // Set HTTP-only cookie
    res.cookie(AUTH_COOKIE_NAME, token, cookieConfig);

    // Return admin info (without password)
    res.json({
      message: "Login successful",
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
      token, // Also return token for clients that prefer header auth
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Login failed",
    });
  }
});

/**
 * POST /api/admin/logout
 * Admin logout - clears the auth cookie
 */
router.post("/logout", (req: Request, res: Response): void => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  res.json({
    message: "Logout successful",
  });
});

/**
 * GET /api/admin/me
 * Get current authenticated admin info
 */
router.get("/me", requireAuth, (req: Request, res: Response): void => {
  res.json({
    admin: req.admin,
  });
});

/**
 * PATCH /api/admin/me
 * Update current admin's profile (name, password)
 */
router.patch("/me", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const adminId = req.admin!.id;

    const updateData: { name?: string; password?: string } = {};

    // Update name if provided
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        res.status(400).json({
          error: "Bad Request",
          message: "Name cannot be empty",
        });
        return;
      }
      updateData.name = name.trim();
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({
          error: "Bad Request",
          message: "Current password is required to set a new password",
        });
        return;
      }

      // Verify current password
      const admin = await prisma.admin.findUnique({
        where: { id: adminId },
      });

      if (!admin) {
        res.status(404).json({
          error: "Not Found",
          message: "Admin not found",
        });
        return;
      }

      const isValidPassword = await bcrypt.compare(currentPassword, admin.password);
      if (!isValidPassword) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Current password is incorrect",
        });
        return;
      }

      // Validate new password
      if (newPassword.length < 6) {
        res.status(400).json({
          error: "Bad Request",
          message: "New password must be at least 6 characters",
        });
        return;
      }

      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        error: "Bad Request",
        message: "No valid fields to update",
      });
      return;
    }

    // Update admin
    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      data: updateData,
    });

    res.json({
      message: "Profile updated successfully",
      admin: updatedAdmin,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update profile",
    });
  }
});

export default router;
