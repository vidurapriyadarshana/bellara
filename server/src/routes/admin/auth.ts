import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import authController from "../../controllers/admin/auth.controller";

const router = Router();

// Authentication routes
router.post("/login", authController.login.bind(authController));
router.post("/logout", authController.logout.bind(authController));

// Protected routes - require authentication
router.get("/me", requireAuth, authController.getCurrentAdmin.bind(authController));
router.patch("/me", requireAuth, authController.updateProfile.bind(authController));

export default router;
