import path from "path";

// Upload configuration
export const uploadConfig = {
  // Base directory for all uploads
  baseDir: process.env.UPLOAD_DIR || "./assets",

  // Subdirectories for different upload types
  directories: {
    products: "products",
    receipts: "receipts",
    categories: "categories",
  },

  // Maximum file size (default: 5MB)
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880", 10),

  // Allowed MIME types for images
  allowedMimeTypes: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ],

  // Allowed file extensions
  allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
};

// Get full path for a specific upload type
export const getUploadPath = (type: keyof typeof uploadConfig.directories): string => {
  return path.join(uploadConfig.baseDir, uploadConfig.directories[type]);
};

// Get relative path for storage (used in database)
export const getRelativePath = (type: keyof typeof uploadConfig.directories, filename: string): string => {
  return `${uploadConfig.directories[type]}/${filename}`;
};

// Validate file extension
export const isValidExtension = (filename: string): boolean => {
  const ext = path.extname(filename).toLowerCase();
  return uploadConfig.allowedExtensions.includes(ext);
};

// Validate MIME type
export const isValidMimeType = (mimeType: string): boolean => {
  return uploadConfig.allowedMimeTypes.includes(mimeType);
};
