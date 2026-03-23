import prisma from "../lib/prisma";
import { deleteFile, getFileUrl } from "../utils/file";
import { generateSlug, generateUniqueSlug } from "../utils/slug";
import {
  CategoryResponse,
  CategoryModel,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../types/category";
import { CATEGORY_ERROR_MESSAGES } from "../constants/category";

/**
 * Category Service
 * Handles all business logic related to categories
 */
class CategoryService {
  /**
   * Create a new category
   */
  async createCategory(data: CreateCategoryRequest): Promise<CategoryResponse> {
    const { name, slug: providedSlug } = data;

    // Generate or validate slug
    let slug = providedSlug || generateSlug(name);

    // Ensure slug is unique
    slug = await generateUniqueSlug(slug, async (s: string) => {
      const existing = await prisma.category.findUnique({ where: { slug: s } });
      return existing !== null;
    });

    // Create category
    const category = await prisma.category.create({
      data: {
        name,
        slug,
      },
    });

    return this.mapCategoryToResponse(category, 0);
  }

  /**
   * Get all categories
   */
  async getAllCategories(): Promise<CategoryResponse[]> {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return categories.map((cat: any) => this.mapCategoryToResponse(cat, cat._count.products));
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<CategoryResponse | null> {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return null;
    }

    return this.mapCategoryToResponse(category, category._count.products);
  }

  /**
   * Get category by slug (public)
   */
  async getCategoryBySlug(slug: string): Promise<CategoryResponse | null> {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return null;
    }

    return this.mapCategoryToResponse(category, category._count.products);
  }

  /**
   * Update category
   */
  async updateCategory(
    id: string,
    data: UpdateCategoryRequest
  ): Promise<CategoryResponse | null> {
    // Check if category exists
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return null;
    }

    // Build update data
    const updateData: { name?: string; slug?: string } = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.slug !== undefined) {
      // Check if slug is unique (excluding current category)
      const slugExists = await prisma.category.findFirst({
        where: {
          slug: data.slug,
          NOT: { id },
        },
      });

      if (slugExists) {
        throw new Error(CATEGORY_ERROR_MESSAGES.DUPLICATE_SLUG);
      }

      updateData.slug = data.slug;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      throw new Error(CATEGORY_ERROR_MESSAGES.NO_FIELDS_TO_UPDATE);
    }

    // Update category
    const updated = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return this.mapCategoryToResponse(updated, updated._count.products);
  }

  /**
   * Delete category
   */
  async deleteCategory(id: string): Promise<boolean> {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return false;
    }

    // Check if category has products
    if (category._count.products > 0) {
      throw new Error(
        `${CATEGORY_ERROR_MESSAGES.HAS_PRODUCTS} (${category._count.products} product(s))`
      );
    }

    // Delete category image if exists
    if (category.image) {
      deleteFile(category.image);
    }

    // Delete category
    await prisma.category.delete({ where: { id } });

    return true;
  }

  /**
   * Upload category image
   */
  async uploadCategoryImage(categoryId: string, imagePath: string): Promise<CategoryResponse> {
    // Check if category exists
    const existing = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!existing) {
      // Delete uploaded file if category doesn't exist
      deleteFile(imagePath);
      throw new Error(CATEGORY_ERROR_MESSAGES.NOT_FOUND);
    }

    // Delete old image if exists
    if (existing.image) {
      deleteFile(existing.image);
    }

    // Update category with new image
    const category = await prisma.category.update({
      where: { id: categoryId },
      data: { image: imagePath },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return this.mapCategoryToResponse(category, category._count.products);
  }

  /**
   * Delete category image
   */
  async deleteCategoryImage(id: string): Promise<CategoryResponse> {
    const category = await prisma.category.findUnique({ where: { id } });

    if (!category) {
      throw new Error(CATEGORY_ERROR_MESSAGES.NOT_FOUND);
    }

    if (!category.image) {
      throw new Error(CATEGORY_ERROR_MESSAGES.NO_IMAGE);
    }

    // Delete image file
    deleteFile(category.image);

    // Update category
    const updated = await prisma.category.update({
      where: { id },
      data: { image: null },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return this.mapCategoryToResponse(updated, updated._count.products);
  }

  /**
   * Helper: Map database category to response format
   */
  private mapCategoryToResponse(category: CategoryModel, productCount: number): CategoryResponse {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      image: category.image,
      imageUrl: getFileUrl(category.image),
      productCount,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}

// Export singleton instance
export default new CategoryService();
