import { Router } from "express";
import authRoutes from "./auth";
import categoryRoutes from "./categories";
import productRoutes from "./products";

const router = Router();

// Auth routes (login, logout, me)
router.use("/", authRoutes);

// Category management
router.use("/categories", categoryRoutes);

// Product management
router.use("/products", productRoutes);

// Future admin routes will be added here:
// router.use("/orders", orderRoutes);
// router.use("/dashboard", dashboardRoutes);

export default router;
