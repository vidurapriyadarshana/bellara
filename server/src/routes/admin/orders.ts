import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import orderController from "@/controllers/order.controller";

const router = Router();

// All routes require admin authentication
router.use(requireAuth);

/**
 * List orders with filtering (admin only)
 * GET /api/admin/orders
 * Query parameters:
 *   - page: number (default: 1)
 *   - limit: number (default: 20, max: 100)
 *   - status: PENDING | CONFIRMED | PROCESSING | PACKAGED | SHIPPED | DELIVERED | CANCELLED (optional)
 *   - paymentMethod: CASH_ON_DELIVERY | BANK_TRANSFER (optional)
 *   - paymentStatus: PENDING | PAID | FAILED | REFUNDED (optional)
 *   - startDate: ISO date string (optional)
 *   - endDate: ISO date string (optional)
 *   - searchTerm: search in customer name, email, or order number (optional)
 */
router.get("/", orderController.listOrders.bind(orderController));

/**
 * Get order details by ID (admin only)
 * GET /api/admin/orders/:id
 * Path parameters:
 *   - id: Order ID (UUID)
 */
router.get("/:id", orderController.getOrderById.bind(orderController));

/**
 * Get order status history (admin only)
 * GET /api/admin/orders/:id/history
 * Path parameters:
 *   - id: Order ID (UUID)
 */
router.get("/:id/history", orderController.getOrderStatusHistory.bind(orderController));

/**
 * Update order status (admin only)
 * PATCH /api/admin/orders/:id/status
 * Path parameters:
 *   - id: Order ID (UUID)
 * Body parameters:
 *   - status: New order status (PENDING, CONFIRMED, PROCESSING, PACKAGED, SHIPPED, DELIVERED, CANCELLED)
 *   - note: Optional admin note about the status change
 */
router.patch("/:id/status", orderController.updateOrderStatus.bind(orderController));

/**
 * Add tracking code to order (admin only)
 * PATCH /api/admin/orders/:id/tracking
 * Path parameters:
 *   - id: Order ID (UUID)
 * Body parameters:
 *   - trackingCode: Courier tracking code (5-100 characters)
 *   - courierName: Name of courier service (2-100 characters)
 *   - note: Optional admin note
 */
router.patch("/:id/tracking", orderController.addTrackingCode.bind(orderController));

export default router;
