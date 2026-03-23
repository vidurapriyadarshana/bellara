import { Request, Response } from "express";
import categoryService from "../../services/category.service";
import { createCategorySchema, updateCategorySchema } from "../../validators/category";
import { getRelativePath } from "../../config/upload";
import {
  CATEGORY_ERROR_MESSAGES,
  CATEGORY_SUCCESS_MESSAGES,
  HttpStatus,
} from "../../constants/category";

/**
 * Admin Category Controller
 * Handles admin category management operations
 */
class AdminCategoryController {
  /**
   * Create a new category
   * POST /api/admin/categories
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const parseResult = createCategorySchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(HttpStatus.BAD_REQUEST).json({
          error: "Validation Error",
          message: parseResult.error.issues[0].message,
          errors: parseResult.error.issues,
        });
        return;
      }

      const category = await categoryService.createCategory(parseResult.data);

      res.status(HttpStatus.CREATED).json({
        message: CATEGORY_SUCCESS_MESSAGES.CREATED,
        category,
      });
    } catch (error) {
      console.error("Create category error:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: CATEGORY_ERROR_MESSAGES.INTERNAL_ERROR,
        message: "Failed to create category",
      });
    }
  }

  /**
   * List all categories
   * GET /api/admin/categories
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
   * Get single category by ID
   * GET /api/admin/categories/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const category = await categoryService.getCategoryById(id);

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

  /**
   * Update category
   * PATCH /api/admin/categories/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      // Check if category exists
      const existing = await categoryService.getCategoryById(id);
      if (!existing) {
        res.status(HttpStatus.NOT_FOUND).json({
          error: "Not Found",
          message: CATEGORY_ERROR_MESSAGES.NOT_FOUND,
        });
        return;
      }

      // Validate input
      const parseResult = updateCategorySchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(HttpStatus.BAD_REQUEST).json({
          error: "Validation Error",
          message: parseResult.error.issues[0].message,
          errors: parseResult.error.issues,
        });
        return;
      }

      try {
        const category = await categoryService.updateCategory(id, parseResult.data);
        res.json({
          message: CATEGORY_SUCCESS_MESSAGES.UPDATED,
          category,
        });
      } catch (error: any) {
        if (error.message === CATEGORY_ERROR_MESSAGES.DUPLICATE_SLUG) {
          res.status(HttpStatus.CONFLICT).json({
            error: "Conflict",
            message: error.message,
          });
        } else if (error.message === CATEGORY_ERROR_MESSAGES.NO_FIELDS_TO_UPDATE) {
          res.status(HttpStatus.BAD_REQUEST).json({
            error: "Bad Request",
            message: error.message,
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("Update category error:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: CATEGORY_ERROR_MESSAGES.INTERNAL_ERROR,
        message: "Failed to update category",
      });
    }
  }

  /**
   * Delete category
   * DELETE /api/admin/categories/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      try {
        const deleted = await categoryService.deleteCategory(id);

        if (!deleted) {
          res.status(HttpStatus.NOT_FOUND).json({
            error: "Not Found",
            message: CATEGORY_ERROR_MESSAGES.NOT_FOUND,
          });
          return;
        }

        res.json({
          message: CATEGORY_SUCCESS_MESSAGES.DELETED,
        });
      } catch (error: any) {
        if (error.message.includes(CATEGORY_ERROR_MESSAGES.HAS_PRODUCTS)) {
          res.status(HttpStatus.CONFLICT).json({
            error: "Conflict",
            message: error.message,
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("Delete category error:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: CATEGORY_ERROR_MESSAGES.INTERNAL_ERROR,
        message: "Failed to delete category",
      });
    }
  }

  /**
   * Upload category image
   * POST /api/admin/categories/:id/image
   */
  async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const file = req.file;

      if (!file) {
        res.status(HttpStatus.BAD_REQUEST).json({
          error: "Bad Request",
          message: CATEGORY_ERROR_MESSAGES.NO_FILE_PROVIDED,
        });
        return;
      }

      try {
        const imagePath = getRelativePath("categories", file.filename);
        const category = await categoryService.uploadCategoryImage(id, imagePath);

        res.json({
          message: CATEGORY_SUCCESS_MESSAGES.IMAGE_UPLOADED,
          category,
        });
      } catch (error: any) {
        if (error.message === CATEGORY_ERROR_MESSAGES.NOT_FOUND) {
          res.status(HttpStatus.NOT_FOUND).json({
            error: "Not Found",
            message: error.message,
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("Upload category image error:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: CATEGORY_ERROR_MESSAGES.INTERNAL_ERROR,
        message: CATEGORY_ERROR_MESSAGES.IMAGE_UPLOAD_FAILED,
      });
    }
  }

  /**
   * Delete category image
   * DELETE /api/admin/categories/:id/image
   */
  async deleteImage(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      try {
        const category = await categoryService.deleteCategoryImage(id);

        res.json({
          message: CATEGORY_SUCCESS_MESSAGES.IMAGE_DELETED,
          category,
        });
      } catch (error: any) {
        if (error.message === CATEGORY_ERROR_MESSAGES.NOT_FOUND) {
          res.status(HttpStatus.NOT_FOUND).json({
            error: "Not Found",
            message: error.message,
          });
        } else if (error.message === CATEGORY_ERROR_MESSAGES.NO_IMAGE) {
          res.status(HttpStatus.BAD_REQUEST).json({
            error: "Bad Request",
            message: error.message,
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("Delete category image error:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: CATEGORY_ERROR_MESSAGES.INTERNAL_ERROR,
        message: "Failed to delete category image",
      });
    }
  }
}

// Export singleton instance
export default new AdminCategoryController();
