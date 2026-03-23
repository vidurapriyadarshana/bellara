import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { generateToken } from "../lib/jwt";
import {
  AdminInfo,
  AdminProfileInfo,
  LoginRequest,
  UpdateProfileRequest,
  AdminModel,
} from "../types/auth";
import {
  AUTH_ERROR_MESSAGES,
  PASSWORD_CONSTRAINTS,
} from "../constants/auth";

/**
 * Authentication Service
 * Handles all authentication-related business logic
 */
class AuthService {
  /**
   * Login admin with email and password
   */
  async login(data: LoginRequest): Promise<{ admin: AdminInfo; token: string }> {
    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (!admin) {
      throw new Error(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, admin.password);
    if (!isValidPassword) {
      throw new Error(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Generate JWT token
    const token = generateToken({
      adminId: admin.id,
      email: admin.email,
    });

    return {
      admin: this.mapAdminToResponse(admin),
      token,
    };
  }

  /**
   * Get current admin profile
   */
  async getCurrentAdmin(adminId: string): Promise<AdminInfo | null> {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      return null;
    }

    return this.mapAdminToResponse(admin);
  }

  /**
   * Update admin profile (name and/or password)
   */
  async updateProfile(
    adminId: string,
    data: UpdateProfileRequest
  ): Promise<AdminProfileInfo> {
    // Check if admin exists
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new Error(AUTH_ERROR_MESSAGES.ADMIN_NOT_FOUND);
    }

    const updateData: { name?: string; password?: string } = {};

    // Update name if provided
    if (data.name !== undefined) {
      if (typeof data.name !== "string" || data.name.trim().length === 0) {
        throw new Error(AUTH_ERROR_MESSAGES.INVALID_NAME);
      }
      updateData.name = data.name.trim();
    }

    // Update password if provided
    if (data.newPassword) {
      if (!data.currentPassword) {
        throw new Error(AUTH_ERROR_MESSAGES.CURRENT_PASSWORD_REQUIRED);
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        data.currentPassword,
        admin.password
      );
      if (!isValidPassword) {
        throw new Error(AUTH_ERROR_MESSAGES.INCORRECT_PASSWORD);
      }

      // Hash new password
      updateData.password = await bcrypt.hash(
        data.newPassword,
        PASSWORD_CONSTRAINTS.BCRYPT_ROUNDS
      );
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      throw new Error(AUTH_ERROR_MESSAGES.NO_FIELDS_TO_UPDATE);
    }

    // Update admin
    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedAdmin as AdminProfileInfo;
  }

  /**
   * Helper: Map admin to response format (exclude password)
   */
  private mapAdminToResponse(admin: AdminModel): AdminInfo {
    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    };
  }
}

// Export singleton instance
export default new AuthService();
