import { Router } from "express";
import publicProductController from "@/controllers/public/product.controller";

const router = Router();

// Public product endpoints (no authentication required)
router.get("/", publicProductController.listProducts.bind(publicProductController));
router.get("/:slug", publicProductController.getProductBySlug.bind(publicProductController));
router.get("/:slug/related", publicProductController.getRelatedProducts.bind(publicProductController));

export default router;
