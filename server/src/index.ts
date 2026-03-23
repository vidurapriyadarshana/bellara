import "dotenv/config";
import express, { Request, Response } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import prisma from "./lib/prisma";
import { initializeUploadDirectories, handleMulterError } from "./middleware/upload";
import { uploadConfig } from "./config/upload";
import { notFoundHandler, errorHandler } from "./middleware/error";
import adminRoutes from "./routes/admin";
import publicRoutes from "./routes/public";

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:8080";

// Initialize upload directories on startup
initializeUploadDirectories();

// Middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true, // Allow cookies
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from assets directory
app.use("/assets", express.static(path.resolve(uploadConfig.baseDir)));

// Health check route
app.get("/health", async (req: Request, res: Response) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected", timestamp: new Date().toISOString() });
  } catch {
    res.status(500).json({ status: "error", database: "disconnected", timestamp: new Date().toISOString() });
  }
});

// API routes
app.get("/api", (req: Request, res: Response) => {
  res.json({ message: "Welcome to Bellara API" });
});

// Public routes (no auth required)
app.use("/api", publicRoutes);

// Admin routes (auth required)
app.use("/api/admin", adminRoutes);

// Multer error handling middleware
app.use(handleMulterError);

// 404 handler for unknown routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
