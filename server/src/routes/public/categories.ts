import { Router } from "express";
import publicCategoryController from "../../controllers/public/category.controller";

const router = Router();

// Public category endpoints (no authentication required)
router.get("/", publicCategoryController.list.bind(publicCategoryController));
router.get("/:slug", publicCategoryController.getBySlug.bind(publicCategoryController));

export default router;
