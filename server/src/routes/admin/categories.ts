import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { uploadCategoryImage } from "../../middleware/upload";
import adminCategoryController from "../../controllers/admin/category.controller";

const router = Router();

// All category routes require authentication
router.use(requireAuth);

// Category CRUD operations
router.post("/", adminCategoryController.create.bind(adminCategoryController));
router.get("/", adminCategoryController.list.bind(adminCategoryController));
router.get("/:id", adminCategoryController.getById.bind(adminCategoryController));
router.patch("/:id", adminCategoryController.update.bind(adminCategoryController));
router.delete("/:id", adminCategoryController.delete.bind(adminCategoryController));

// Category image operations
router.post(
  "/:id/image",
  uploadCategoryImage,
  adminCategoryController.uploadImage.bind(adminCategoryController)
);
router.delete("/:id/image", adminCategoryController.deleteImage.bind(adminCategoryController));

export default router;
