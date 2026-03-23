import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { v4 as uuidv4 } from "uuid";
import { uploadConfig, getUploadPath, isValidMimeType, isValidExtension } from "../config/upload";

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Initialize all upload directories
export const initializeUploadDirectories = (): void => {
  Object.keys(uploadConfig.directories).forEach((key) => {
    const dirPath = getUploadPath(key as keyof typeof uploadConfig.directories);
    ensureDirectoryExists(dirPath);
  });
};

// File filter for image validation
const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
): void => {
  // Check MIME type
  if (!isValidMimeType(file.mimetype)) {
    callback(new Error(`Invalid file type. Allowed types: ${uploadConfig.allowedMimeTypes.join(", ")}`));
    return;
  }

  // Check file extension
  if (!isValidExtension(file.originalname)) {
    callback(new Error(`Invalid file extension. Allowed extensions: ${uploadConfig.allowedExtensions.join(", ")}`));
    return;
  }

  callback(null, true);
};

// Generate unique filename
const generateFilename = (originalname: string): string => {
  const ext = path.extname(originalname).toLowerCase();
  const uniqueId = uuidv4();
  return `${uniqueId}${ext}`;
};

// Create storage configuration for a specific upload type
const createStorage = (uploadType: keyof typeof uploadConfig.directories) => {
  return multer.diskStorage({
    destination: (req, file, callback) => {
      const uploadPath = getUploadPath(uploadType);
      ensureDirectoryExists(uploadPath);
      callback(null, uploadPath);
    },
    filename: (req, file, callback) => {
      const filename = generateFilename(file.originalname);
      callback(null, filename);
    },
  });
};

// Product images upload middleware (multiple files)
export const uploadProductImages = multer({
  storage: createStorage("products"),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: uploadConfig.maxFileSize,
    files: 10, // Maximum 10 images per product
  },
}).array("images", 10);

// Single product image upload
export const uploadSingleProductImage = multer({
  storage: createStorage("products"),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: uploadConfig.maxFileSize,
  },
}).single("image");

// Payment receipt upload (single file)
export const uploadPaymentReceipt = multer({
  storage: createStorage("receipts"),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: uploadConfig.maxFileSize,
  },
}).single("receipt");

// Category image upload (single file)
export const uploadCategoryImage = multer({
  storage: createStorage("categories"),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: uploadConfig.maxFileSize,
  },
}).single("image");

// Generic multer error handler middleware
export const handleMulterError = (
  err: Error,
  req: Request,
  res: import("express").Response,
  next: import("express").NextFunction
): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        error: "File too large",
        message: `Maximum file size is ${uploadConfig.maxFileSize / (1024 * 1024)}MB`,
      });
      return;
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      res.status(400).json({
        error: "Too many files",
        message: "Maximum 10 files allowed per upload",
      });
      return;
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      res.status(400).json({
        error: "Unexpected field",
        message: "Invalid form field name for file upload",
      });
      return;
    }
    res.status(400).json({
      error: "Upload error",
      message: err.message,
    });
    return;
  }

  if (err.message.includes("Invalid file type") || err.message.includes("Invalid file extension")) {
    res.status(400).json({
      error: "Invalid file",
      message: err.message,
    });
    return;
  }

  next(err);
};
