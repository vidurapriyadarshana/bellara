import { Request, Response } from "express";
import { ProductService } from "@/services/product.service";
import { paginationSchema } from "@/validators/product";
import { PRODUCT_MESSAGES, HTTP_STATUS } from "@/constants/product";
import type { PaginationInput } from "@/validators/product";

class PublicProductController {
  /**
   * List all active products with filtering, search, and pagination
   * GET /api/products
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

      // Override isActive to always filter for active products (public endpoint)
      const result = await ProductService.listProducts(
        page,
        limit,
        categoryId,
        search,
        true // Only show active products publicly
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
   * Get product by slug with full details including images
   * GET /api/products/:slug
   */
  async getProductBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params as { slug: string };

      if (!slug) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Product slug is required",
        });
        return;
      }

      const product = await ProductService.getProductBySlug(slug);

      // Only return active products publicly
      if (!product.isActive) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: PRODUCT_MESSAGES.NOT_FOUND,
        });
        return;
      }

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
   * Get related products from same category (excluding current product)
   * GET /api/products/:slug/related
   */
  async getRelatedProducts(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params as { slug: string };
      const limit = (req.query.limit as string) ? parseInt(req.query.limit as string) : 4;

      if (!slug) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Product slug is required",
        });
        return;
      }

      if (isNaN(limit) || limit < 1 || limit > 100) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Invalid limit parameter",
        });
        return;
      }

      // Get the product by slug to find its category
      const product = await ProductService.getProductBySlug(slug);

      if (!product.isActive) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: PRODUCT_MESSAGES.NOT_FOUND,
        });
        return;
      }

      // Get related products from same category
      const result = await ProductService.listProducts(
        1,
        limit,
        product.categoryId,
        undefined,
        true
      );

      // Filter out the current product
      const relatedProducts = result.data.filter((p) => p.id !== product.id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Related products retrieved successfully",
        data: relatedProducts.slice(0, limit),
      });
    } catch (error: any) {
      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to retrieve related products",
      });
    }
  }
}

const publicProductController = new PublicProductController();
export default publicProductController;
