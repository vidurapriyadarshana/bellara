// Product image type definitions

export interface UploadProductImagesRequest {
  files: Express.Multer.File[];
  isPrimary?: boolean;
}

export interface ProductImageResponse {
  id: string;
  productId: string;
  imagePath: string;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: Date;
}

export interface ReorderImagesRequest {
  imageIds: Array<{
    id: string;
    sortOrder: number;
  }>;
}

export interface SetPrimaryImageRequest {
  imageId: string;
}
