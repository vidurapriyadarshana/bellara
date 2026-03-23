import { Request, Response } from "express";
import categoryService from "../../services/category.service";
import { CATEGORY_ERROR_MESSAGES, HttpStatus } from "../../constants/category";

/**
 * Public Category Controller
 * Handles public category browsing operations
 */
class PublicCategoryController {
  /**
   * List all categories (public)
   * GET /api/categories
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const categories = await categoryService.getAllCategories();

      res.json({
        categories,
        total: categories.length,
      });
    } catch (error) {
      console.error("List categories error:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: CATEGORY_ERROR_MESSAGES.INTERNAL_ERROR,
        message: "Failed to fetch categories",
      });
    }
  }

  /**
   * Get category by slug (public)
   * GET /api/categories/:slug
   */
  async getBySlug(req: Request, res: Response): Promise<void> {
    try {
      const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;

      const category = await categoryService.getCategoryBySlug(slug);

      if (!category) {
        res.status(HttpStatus.NOT_FOUND).json({
          error: "Not Found",
          message: CATEGORY_ERROR_MESSAGES.NOT_FOUND,
        });
        return;
      }

      res.json({ category });
    } catch (error) {
      console.error("Get category error:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: CATEGORY_ERROR_MESSAGES.INTERNAL_ERROR,
        message: "Failed to fetch category",
      });
    }
  }
}

// Export singleton instance
export default new PublicCategoryController();
