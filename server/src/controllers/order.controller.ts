import { Request, Response } from "express";
import { OrderService } from "@/services/order.service";
import { createOrderSchema, paginationSchema, uploadPaymentProofSchema, listOrdersFilterSchema, updateOrderStatusSchema, addTrackingCodeSchema } from "@/validators/order";
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
   * Supports filtering by status, payment method, payment status, date range, and search term
   */
  async listOrders(req: Request, res: Response): Promise<void> {
    try {
      const validatedQuery = listOrdersFilterSchema.parse(req.query);
      const { page, limit, ...filters } = validatedQuery;

      const result = await OrderService.listOrders(page, limit, filters);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: ORDER_MESSAGES.LISTED_SUCCESS,
        data: result,
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        let errorMessage = ORDER_MESSAGES.INVALID_PAGINATION;

        if (error.errors && error.errors.length > 0) {
          const firstError = error.errors[0];
          if (firstError?.message) {
            errorMessage = firstError.message;
          }
        }

        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: errorMessage,
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
   * Get order details by ID (admin only)
   * GET /api/admin/orders/:id
   */
  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      if (!id) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Order ID is required",
        });
        return;
      }

      const order = await OrderService.getOrderById(id);

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

  /**
   * Update order status (admin only)
   * PATCH /api/admin/orders/:id/status
   */
  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const admin = (req as any).admin;

      if (!id) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Order ID is required",
        });
        return;
      }

      // Validate request body
      const validatedData = updateOrderStatusSchema.parse(req.body);

      // Update status
      const result = await OrderService.updateOrderStatus(
        id,
        validatedData.status,
        validatedData.note,
        admin?.id
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: ORDER_MESSAGES.STATUS_UPDATED_SUCCESS,
        data: result,
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        let errorMessage = "Invalid status update request";

        if (error.errors && error.errors.length > 0) {
          const firstError = error.errors[0];
          if (firstError?.message) {
            errorMessage = firstError.message;
          }
        }

        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: errorMessage,
          errors: error.errors,
        });
        return;
      }

      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || ORDER_MESSAGES.FAILED_TO_UPDATE_STATUS,
      });
    }
  }

  /**
   * Add tracking code to order (admin only)
   * PATCH /api/admin/orders/:id/tracking
   */
  async addTrackingCode(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const admin = (req as any).admin;

      if (!id) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Order ID is required",
        });
        return;
      }

      // Validate request body
      const validatedData = addTrackingCodeSchema.parse(req.body);

      // Add tracking code
      const result = await OrderService.addTrackingCode(
        id,
        validatedData.trackingCode,
        validatedData.courierName,
        validatedData.note,
        admin?.id
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: ORDER_MESSAGES.TRACKING_UPDATED_SUCCESS,
        data: result,
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        let errorMessage = "Invalid tracking code request";

        if (error.errors && error.errors.length > 0) {
          const firstError = error.errors[0];
          if (firstError?.message) {
            errorMessage = firstError.message;
          }
        }

        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: errorMessage,
          errors: error.errors,
        });
        return;
      }

      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to add tracking code",
      });
    }
  }

  /**
   * Get order status history (admin only)
   * GET /api/admin/orders/:id/history
   */
  async getOrderStatusHistory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      if (!id) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Order ID is required",
        });
        return;
      }

      const history = await OrderService.getOrderStatusHistory(id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Order status history retrieved successfully",
        data: history,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to retrieve order status history",
      });
    }
  }
}

const orderController = new OrderController();
export default orderController;
