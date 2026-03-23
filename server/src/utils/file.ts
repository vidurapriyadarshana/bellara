import fs from "fs";
import path from "path";
import { uploadConfig, getUploadPath } from "../config/upload";

/**
 * Delete a file from the uploads directory
 * @param relativePath - The relative path stored in the database (e.g., "products/uuid.jpg")
 * @returns true if deleted successfully, false otherwise
 */
export const deleteFile = (relativePath: string): boolean => {
  try {
    const fullPath = path.join(uploadConfig.baseDir, relativePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error deleting file ${relativePath}:`, error);
    return false;
  }
};

/**
 * Delete multiple files
 * @param relativePaths - Array of relative paths to delete
 * @returns Number of files successfully deleted
 */
export const deleteFiles = (relativePaths: string[]): number => {
  let deletedCount = 0;
  for (const relativePath of relativePaths) {
    if (deleteFile(relativePath)) {
      deletedCount++;
    }
  }
  return deletedCount;
};

/**
 * Check if a file exists
 * @param relativePath - The relative path stored in the database
 * @returns true if file exists
 */
export const fileExists = (relativePath: string): boolean => {
  const fullPath = path.join(uploadConfig.baseDir, relativePath);
  return fs.existsSync(fullPath);
};

/**
 * Get the full file path from a relative path
 * @param relativePath - The relative path stored in the database
 * @returns Full file system path
 */
export const getFullPath = (relativePath: string): string => {
  return path.join(uploadConfig.baseDir, relativePath);
};

/**
 * Get file stats
 * @param relativePath - The relative path stored in the database
 * @returns File stats or null if file doesn't exist
 */
export const getFileStats = (relativePath: string): fs.Stats | null => {
  try {
    const fullPath = getFullPath(relativePath);
    if (fs.existsSync(fullPath)) {
      return fs.statSync(fullPath);
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Get the public URL path for a file (used in API responses)
 * @param relativePath - The relative path stored in the database
 * @returns URL path for the file
 */
export const getFileUrl = (relativePath: string | null): string | null => {
  if (!relativePath) return null;
  return `/assets/${relativePath}`;
};

/**
 * Clean up orphaned files in a directory
 * @param uploadType - The type of upload directory to clean
 * @param validPaths - Array of valid relative paths that should be kept
 * @returns Number of files deleted
 */
export const cleanupOrphanedFiles = (
  uploadType: keyof typeof uploadConfig.directories,
  validPaths: string[]
): number => {
  const dirPath = getUploadPath(uploadType);
  let deletedCount = 0;

  if (!fs.existsSync(dirPath)) {
    return 0;
  }

  const files = fs.readdirSync(dirPath);
  const validFilenames = new Set(validPaths.map((p) => path.basename(p)));

  for (const file of files) {
    // Skip .gitkeep files
    if (file === ".gitkeep") continue;

    if (!validFilenames.has(file)) {
      const filePath = path.join(dirPath, file);
      try {
        fs.unlinkSync(filePath);
        deletedCount++;
      } catch (error) {
        console.error(`Error deleting orphaned file ${filePath}:`, error);
      }
    }
  }

  return deletedCount;
};

/**
 * Get the MIME type based on file extension
 * @param filename - The filename or path
 * @returns MIME type string
 */
export const getMimeType = (filename: string): string => {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };
  return mimeTypes[ext] || "application/octet-stream";
};
