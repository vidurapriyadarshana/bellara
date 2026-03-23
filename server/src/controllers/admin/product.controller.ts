import { Request, Response } from "express";
import { ProductService } from "@/services/product.service";
import {
  createProductSchema,
  updateProductSchema,
  paginationSchema,
} from "@/validators/product";
import {
  reorderImagesSchema,
  setPrimaryImageSchema,
} from "@/validators/product-image";
import { PRODUCT_MESSAGES, HTTP_STATUS } from "@/constants/product";
import { PRODUCT_IMAGE_MESSAGES } from "@/constants/product-image";
import type {
  CreateProductInput,
  UpdateProductInput,
  PaginationInput,
} from "@/validators/product";
import type {
  ReorderImagesInput,
  SetPrimaryImageInput,
} from "@/validators/product-image";

class ProductController {
  /**
   * Create a new product
   * POST /api/admin/products
   */
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createProductSchema.parse(req.body);
      const product = await ProductService.createProduct(
        validatedData as CreateProductInput
      );

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: PRODUCT_MESSAGES.CREATED_SUCCESS,
        data: product,
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Validation failed",
          errors: error.errors,
        });
        return;
      }

      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || PRODUCT_MESSAGES.CREATED_SUCCESS,
      });
    }
  }

  /**
   * Get all products with pagination and filters
   * GET /api/admin/products
   */
  async listProducts(req: Request, res: Response): Promise<void> {
    try {
      const validatedQuery = paginationSchema.parse(req.query);
      const {
        page,
        limit,
        categoryId,
        search,
        isActive,
      } = validatedQuery as PaginationInput;

      const result = await ProductService.listProducts(
        page,
        limit,
        categoryId,
        search,
        isActive
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: PRODUCT_MESSAGES.LISTED_SUCCESS,
        data: result,
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: PRODUCT_MESSAGES.INVALID_PAGINATION,
          errors: error.errors,
        });
        return;
      }

      res.status(HTTP_STATUS.INTERNAL_ERROR).json({
        success: false,
        message: error.message || "Failed to list products",
      });
    }
  }

  /**
   * Get product by ID
   * GET /api/admin/products/:id
   */
  async getProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      if (!id) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Product ID is required",
        });
        return;
      }

      const product = await ProductService.getProductById(id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: PRODUCT_MESSAGES.RETRIEVED_SUCCESS,
        data: product,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || PRODUCT_MESSAGES.NOT_FOUND,
      });
    }
  }

  /**
   * Update product
   * PATCH /api/admin/products/:id
   */
  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      if (!id) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Product ID is required",
        });
        return;
      }

      const validatedData = updateProductSchema.parse(req.body);

      if (Object.keys(validatedData).length === 0) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "No fields to update",
        });
        return;
      }

      const product = await ProductService.updateProduct(
        id,
        validatedData as UpdateProductInput
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: PRODUCT_MESSAGES.UPDATED_SUCCESS,
        data: product,
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Validation failed",
          errors: error.errors,
        });
        return;
      }

      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to update product",
      });
    }
  }

  /**
   * Delete product
   * DELETE /api/admin/products/:id
   */
  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      if (!id) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Product ID is required",
        });
        return;
      }

      await ProductService.deleteProduct(id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: PRODUCT_MESSAGES.DELETED_SUCCESS,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to delete product",
      });
    }
  }

  /**
   * Upload product images
   * POST /api/admin/products/:id/images
   */
  async uploadImages(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      if (!id) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Product ID is required",
        });
        return;
      }

      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: PRODUCT_IMAGE_MESSAGES.NO_FILES_PROVIDED,
        });
        return;
      }

      const isPrimary = req.body.isPrimary === "true" || req.body.isPrimary === true;

      const images = await ProductService.uploadProductImages(
        id,
        files,
        isPrimary
      );

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: PRODUCT_IMAGE_MESSAGES.UPLOADED_SUCCESS,
        data: images,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to upload images",
      });
    }
  }

  /**
   * Delete product image
   * DELETE /api/admin/products/:id/images/:imageId
   */
  async deleteImage(req: Request, res: Response): Promise<void> {
    try {
      const { id, imageId } = req.params as { id: string; imageId: string };

      if (!id || !imageId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Product ID and Image ID are required",
        });
        return;
      }

      await ProductService.deleteProductImage(id, imageId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: PRODUCT_IMAGE_MESSAGES.DELETED_SUCCESS,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to delete image",
      });
    }
  }

  /**
   * Set image as primary
   * PATCH /api/admin/products/:id/images/:imageId/primary
   */
  async setPrimaryImage(req: Request, res: Response): Promise<void> {
    try {
      const { id, imageId } = req.params as { id: string; imageId: string };

      if (!id || !imageId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Product ID and Image ID are required",
        });
        return;
      }

      const image = await ProductService.setPrimaryImage(id, imageId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: PRODUCT_IMAGE_MESSAGES.PRIMARY_SET_SUCCESS,
        data: image,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to set primary image",
      });
    }
  }

  /**
   * Reorder product images
   * PATCH /api/admin/products/:id/images/reorder
   */
  async reorderImages(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      if (!id) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Product ID is required",
        });
        return;
      }

      const validatedData = reorderImagesSchema.parse(req.body);
      const images = await ProductService.reorderProductImages(
        id,
        validatedData.imageIds
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: PRODUCT_IMAGE_MESSAGES.REORDERED_SUCCESS,
        data: images,
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Validation failed",
          errors: error.errors,
        });
        return;
      }

      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to reorder images",
      });
    }
  }

  /**
   * Get product images
   * GET /api/admin/products/:id/images
   */
  async getImages(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      if (!id) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Product ID is required",
        });
        return;
      }

      const images = await ProductService.getProductImages(id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Product images retrieved successfully",
        data: images,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to retrieve images",
      });
    }
  }
}

const productController = new ProductController();
export default productController;
