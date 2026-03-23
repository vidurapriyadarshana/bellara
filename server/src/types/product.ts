// Product type definitions
export interface CreateProductRequest {
  categoryId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  isActive?: boolean;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  stock?: number;
  isActive?: boolean;
  categoryId?: string;
}

export interface ProductResponse {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductDetailResponse extends ProductResponse {
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: ProductImageResponse[];
}

export interface ProductImageResponse {
  id: string;
  imagePath: string;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: Date;
}

export interface ProductListResponse {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  isActive: boolean;
  primaryImage?: string;
  createdAt: Date;
}

export interface ProductListWithPagination {
  data: ProductListResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
