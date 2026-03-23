import prisma from "@/lib/prisma";
import { generateUniqueSlug } from "@/utils/slug";
import { PRODUCT_MESSAGES, HTTP_STATUS } from "@/constants/product";
import type {
  CreateProductRequest,
  UpdateProductRequest,
  ProductResponse,
  ProductDetailResponse,
  ProductListResponse,
  ProductListWithPagination,
} from "@/types/product";

export class ProductService {
  /**
   * Create a new product
   */
  static async createProduct(
    data: CreateProductRequest
  ): Promise<ProductResponse> {
    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      const error = new Error(PRODUCT_MESSAGES.CATEGORY_NOT_FOUND);
      (error as any).statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(data.name, async (slug: string) => {
      const existing = await prisma.product.findUnique({ where: { slug } });
      return existing !== null;
    });

    // Create product
    const product = await prisma.product.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice || null,
        stock: data.stock,
        isActive: data.isActive ?? true,
      },
    });

    return this.formatProductResponse(product);
  }

  /**
   * Get all products with pagination and filters
   */
  static async listProducts(
    page: number = 1,
    limit: number = 20,
    categoryId?: string,
    search?: string,
    isActive?: boolean
  ): Promise<ProductListWithPagination> {
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Get products and total count
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          images: {
            where: { isPrimary: true },
            select: { imagePath: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    // Format response
    const data: ProductListResponse[] = products.map((product) => ({
      id: product.id,
      categoryId: product.categoryId,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      originalPrice: product.originalPrice
        ? Number(product.originalPrice)
        : null,
      stock: product.stock,
      isActive: product.isActive,
      primaryImage: product.images[0]?.imagePath,
      createdAt: product.createdAt,
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get product by ID with full details
   */
  static async getProductById(id: string): Promise<ProductDetailResponse> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            imagePath: true,
            isPrimary: true,
            sortOrder: true,
            createdAt: true,
          },
        },
      },
    });

    if (!product) {
      const error = new Error(PRODUCT_MESSAGES.NOT_FOUND);
      (error as any).statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    return {
      id: product.id,
      categoryId: product.categoryId,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: Number(product.price),
      originalPrice: product.originalPrice
        ? Number(product.originalPrice)
        : null,
      stock: product.stock,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      category: product.category,
      images: product.images,
    };
  }

  /**
   * Get product by slug (public)
   */
  static async getProductBySlug(slug: string): Promise<ProductDetailResponse> {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            imagePath: true,
            isPrimary: true,
            sortOrder: true,
            createdAt: true,
          },
        },
      },
    });

    if (!product) {
      const error = new Error(PRODUCT_MESSAGES.NOT_FOUND);
      (error as any).statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    return {
      id: product.id,
      categoryId: product.categoryId,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: Number(product.price),
      originalPrice: product.originalPrice
        ? Number(product.originalPrice)
        : null,
      stock: product.stock,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      category: product.category,
      images: product.images,
    };
  }

  /**
   * Update product
   */
  static async updateProduct(
    id: string,
    data: UpdateProductRequest
  ): Promise<ProductResponse> {
    // Verify product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      const error = new Error(PRODUCT_MESSAGES.NOT_FOUND);
      (error as any).statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // If categoryId is provided, verify it exists
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        const error = new Error(PRODUCT_MESSAGES.CATEGORY_NOT_FOUND);
        (error as any).statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }
    }

    // Build update data, only including provided fields
    const updateData: any = {};

    if (data.name !== undefined) {
      // If name changed, generate new slug
      if (data.name !== existingProduct.name) {
        const slug = await generateUniqueSlug(data.name, async (slug: string) => {
          const existing = await prisma.product.findUnique({
            where: { slug },
          });
          return existing !== null;
        });
        updateData.slug = slug;
      }
      updateData.name = data.name;
    }

    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.originalPrice !== undefined)
      updateData.originalPrice = data.originalPrice;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return this.formatProductResponse(updated);
  }

  /**
   * Delete product (soft delete by checking orders)
   */
  static async deleteProduct(id: string): Promise<void> {
    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: {
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!product) {
      const error = new Error(PRODUCT_MESSAGES.NOT_FOUND);
      (error as any).statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // Check if product has orders
    if (product.orderItems.length > 0) {
      const error = new Error(PRODUCT_MESSAGES.CANNOT_DELETE_WITH_ORDERS);
      (error as any).statusCode = HTTP_STATUS.CONFLICT;
      throw error;
    }

    // Delete product images first
    await prisma.productImage.deleteMany({
      where: { productId: id },
    });

    // Delete product
    await prisma.product.delete({
      where: { id },
    });
  }

  /**
   * Format product response (convert Decimal to number)
   */
  private static formatProductResponse(product: any): ProductResponse {
    return {
      id: product.id,
      categoryId: product.categoryId,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: Number(product.price),
      originalPrice: product.originalPrice
        ? Number(product.originalPrice)
        : null,
      stock: product.stock,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  /**
   * Upload product images
   */
  static async uploadProductImages(
    productId: string,
    files: Express.Multer.File[],
    isPrimary: boolean = false
  ): Promise<any[]> {
    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      const error = new Error("Product not found");
      (error as any).statusCode = 404;
      throw error;
    }

    // Check max images limit
    const existingImagesCount = await prisma.productImage.count({
      where: { productId },
    });

    if (existingImagesCount + files.length > 10) {
      const error = new Error("Maximum 10 images per product allowed");
      (error as any).statusCode = 409;
      throw error;
    }

    // Get the highest sort order
    const lastImage = await prisma.productImage.findFirst({
      where: { productId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    let nextSortOrder = (lastImage?.sortOrder ?? -1) + 1;

    // If this is the first image or isPrimary is true, set as primary
    const isProductEmpty = existingImagesCount === 0;
    const shouldSetPrimary = isPrimary || isProductEmpty;

    // If setting a new primary, unset the old one
    if (shouldSetPrimary && !isProductEmpty) {
      await prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });
    }

    // Upload all files
    const uploadedImages = await Promise.all(
      files.map((file) =>
        prisma.productImage.create({
          data: {
            productId,
            imagePath: `products/${file.filename}`,
            isPrimary: shouldSetPrimary && files.indexOf(file) === 0,
            sortOrder: nextSortOrder++,
          },
        })
      )
    );

    return uploadedImages;
  }

  /**
   * Delete product image
   */
  static async deleteProductImage(
    productId: string,
    imageId: string
  ): Promise<string> {
    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      const error = new Error("Product not found");
      (error as any).statusCode = 404;
      throw error;
    }

    // Find the image
    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image || image.productId !== productId) {
      const error = new Error("Product image not found");
      (error as any).statusCode = 404;
      throw error;
    }

    // Check if this is the only image
    const imageCount = await prisma.productImage.count({
      where: { productId },
    });

    if (imageCount === 1) {
      const error = new Error("Cannot delete the only image of a product");
      (error as any).statusCode = 409;
      throw error;
    }

    // If this is the primary image, set another as primary
    if (image.isPrimary) {
      const nextImage = await prisma.productImage.findFirst({
        where: {
          productId,
          id: { not: imageId },
        },
        orderBy: { sortOrder: "asc" },
      });

      if (nextImage) {
        await prisma.productImage.update({
          where: { id: nextImage.id },
          data: { isPrimary: true },
        });
      }
    }

    // Delete the image record
    await prisma.productImage.delete({
      where: { id: imageId },
    });

    // Return the image path for file deletion
    return image.imagePath;
  }

  /**
   * Set image as primary
   */
  static async setPrimaryImage(
    productId: string,
    imageId: string
  ): Promise<any> {
    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      const error = new Error("Product not found");
      (error as any).statusCode = 404;
      throw error;
    }

    // Find the image
    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image || image.productId !== productId) {
      const error = new Error("Product image not found");
      (error as any).statusCode = 404;
      throw error;
    }

    // Unset all other images as primary
    await prisma.productImage.updateMany({
      where: { productId, id: { not: imageId } },
      data: { isPrimary: false },
    });

    // Set this image as primary
    const updated = await prisma.productImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    });

    return updated;
  }

  /**
   * Reorder product images
   */
  static async reorderProductImages(
    productId: string,
    imageIds: Array<{ id: string; sortOrder: number }>
  ): Promise<any[]> {
    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      const error = new Error("Product not found");
      (error as any).statusCode = 404;
      throw error;
    }

    // Verify all images belong to this product
    const images = await prisma.productImage.findMany({
      where: { productId },
    });

    const imageIdSet = new Set(images.map((img) => img.id));
    const invalidIds = imageIds.filter((item) => !imageIdSet.has(item.id));

    if (invalidIds.length > 0) {
      const error = new Error("One or more image IDs do not belong to this product");
      (error as any).statusCode = 404;
      throw error;
    }

    // Update sort orders in transaction
    const updated = await Promise.all(
      imageIds.map((item) =>
        prisma.productImage.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    return updated;
  }

  /**
   * Get product images
   */
  static async getProductImages(productId: string): Promise<any[]> {
    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      const error = new Error("Product not found");
      (error as any).statusCode = 404;
      throw error;
    }

    const images = await prisma.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: "asc" },
    });

    return images;
  }
}
