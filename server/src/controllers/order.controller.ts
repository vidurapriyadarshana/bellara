import { Request, Response } from "express";
import { OrderService } from "@/services/order.service";
import { createOrderSchema, paginationSchema, uploadPaymentProofSchema } from "@/validators/order";
import { ORDER_MESSAGES, HTTP_STATUS, ORDER_CONFIG } from "@/constants/order";
import type { CreateOrderRequest, UploadPaymentProofRequest } from "@/types/order";

/**
 * Order Controller
 * Handles order-related requests
 */
class OrderController {
  /**
   * Create a new order (guest checkout)
   * POST /api/orders
   */
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData = createOrderSchema.parse(req.body);

      // Create order
      const order = await OrderService.createOrder(validatedData as CreateOrderRequest);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: ORDER_MESSAGES.CREATED_SUCCESS,
        data: order,
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        // Get the error message - prioritize the first error's message
        let errorMessage = ORDER_MESSAGES.INVALID_REQUEST;

        if (error.errors && error.errors.length > 0) {
          const firstError = error.errors[0];
          if (firstError?.message) {
            errorMessage = firstError.message;
          }
        }

        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: errorMessage,
          errors: error.errors || [],
        });
        return;
      }

      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || ORDER_MESSAGES.FAILED_TO_CREATE,
      });
    }
  }

  /**
   * Get order by order number (public tracking)
   * GET /api/orders/:orderNumber/track
   */
  async getOrderByNumber(req: Request, res: Response): Promise<void> {
    try {
      const { orderNumber } = req.params as { orderNumber: string };

      if (!orderNumber) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Order number is required",
        });
        return;
      }

      const order = await OrderService.getOrderByNumber(orderNumber);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: ORDER_MESSAGES.RETRIEVED_SUCCESS,
        data: order,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || ORDER_MESSAGES.FAILED_TO_RETRIEVE,
      });
    }
  }

  /**
   * List all orders (admin only)
   * GET /api/admin/orders
   */
  async listOrders(req: Request, res: Response): Promise<void> {
    try {
      const validatedQuery = paginationSchema.parse(req.query);
      const { page, limit } = validatedQuery;

      const result = await OrderService.listOrders(page, limit);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: ORDER_MESSAGES.LISTED_SUCCESS,
        data: result,
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ORDER_MESSAGES.INVALID_PAGINATION,
          errors: error.errors,
        });
        return;
      }

      res.status(HTTP_STATUS.INTERNAL_ERROR).json({
        success: false,
        message: error.message || ORDER_MESSAGES.FAILED_TO_LIST,
      });
    }
  }

  /**
   * Upload payment proof for bank transfer order
   * POST /api/orders/:orderNumber/payment
   */
  async uploadPaymentProof(req: Request, res: Response): Promise<void> {
    try {
      const { orderNumber } = req.params as { orderNumber: string };

      // Check if file was uploaded
      if (!req.file) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ORDER_MESSAGES.NO_FILE_PROVIDED,
        });
        return;
      }

      // Validate file type
      if (!ORDER_CONFIG.PAYMENT_PROOF.ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ORDER_MESSAGES.INVALID_FILE_TYPE,
        });
        return;
      }

      // Validate file size (in bytes)
      if (req.file.size > ORDER_CONFIG.PAYMENT_PROOF.MAX_FILE_SIZE) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ORDER_MESSAGES.FILE_TOO_LARGE,
        });
        return;
      }

      // Validate form data (bankName, transferDate, amount)
      const validatedData = uploadPaymentProofSchema.parse(req.body);

      // Construct relative file path for database
      // File is stored at: server/assets/receipts/{filename}
      // Database should store: receipts/{filename}
      const filePath = `receipts/${req.file.filename}`;

      // Call service to upload payment proof
      const paymentProof = await OrderService.uploadPaymentProof(
        orderNumber,
        validatedData as UploadPaymentProofRequest,
        filePath
      );

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: ORDER_MESSAGES.PAYMENT_PROOF_UPLOADED_SUCCESS,
        data: paymentProof,
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        // Get the error message - prioritize the first error's message
        let errorMessage = ORDER_MESSAGES.INVALID_REQUEST;

        if (error.errors && error.errors.length > 0) {
          const firstError = error.errors[0];
          if (firstError?.message) {
            errorMessage = firstError.message;
          }
        }

        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: errorMessage,
          errors: error.errors || [],
        });
        return;
      }

      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || ORDER_MESSAGES.FAILED_TO_UPLOAD_PAYMENT_PROOF,
      });
    }
  }
}

const orderController = new OrderController();
export default orderController;
