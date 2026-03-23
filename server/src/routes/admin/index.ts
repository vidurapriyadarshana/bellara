import { Router } from "express";
import authRoutes from "./auth";

const router = Router();

// Auth routes (login, logout, me)
router.use("/", authRoutes);

// Future admin routes will be added here:
// router.use("/products", productRoutes);
// router.use("/categories", categoryRoutes);
// router.use("/orders", orderRoutes);
// router.use("/dashboard", dashboardRoutes);

export default router;
