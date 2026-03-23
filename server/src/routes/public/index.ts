import { Router } from "express";
import categoryRoutes from "./categories";
import productRoutes from "./products";
import orderRoutes from "./orders";

const router = Router();

// Category routes (public)
router.use("/categories", categoryRoutes);

// Product routes (public)
router.use("/products", productRoutes);

// Order routes (public - guest checkout and tracking)
router.use("/orders", orderRoutes);

export default router;
