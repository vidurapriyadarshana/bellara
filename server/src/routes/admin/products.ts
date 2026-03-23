import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { uploadProductImages } from "@/middleware/upload";
import productController from "@/controllers/admin/product.controller";

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Product CRUD
router.post("/", productController.createProduct.bind(productController));
router.get("/", productController.listProducts.bind(productController));
router.get("/:id", productController.getProduct.bind(productController));
router.patch("/:id", productController.updateProduct.bind(productController));
router.delete("/:id", productController.deleteProduct.bind(productController));

// Product image operations
router.post(
  "/:id/images",
  uploadProductImages,
  productController.uploadImages.bind(productController)
);
router.get("/:id/images", productController.getImages.bind(productController));
router.patch(
  "/:id/images/reorder",
  productController.reorderImages.bind(productController)
);
router.patch(
  "/:id/images/:imageId/primary",
  productController.setPrimaryImage.bind(productController)
);
router.delete(
  "/:id/images/:imageId",
  productController.deleteImage.bind(productController)
);

export default router;
