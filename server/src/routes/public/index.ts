import { Router } from "express";
import categoryRoutes from "./categories";
import productRoutes from "./products";

const router = Router();

// Category routes (public)
router.use("/categories", categoryRoutes);

// Product routes (public)
router.use("/products", productRoutes);

// Future public routes:
// router.use("/orders", orderRoutes);

export default router;
