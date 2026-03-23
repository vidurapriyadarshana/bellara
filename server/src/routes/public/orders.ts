import { Router } from "express";
import orderController from "@/controllers/order.controller";
import { uploadPaymentReceipt, handleMulterError } from "@/middleware/upload";

const router = Router();

// Public routes (no authentication required)

// Create order (guest checkout)
router.post("/", orderController.createOrder.bind(orderController));

// Get order by order number (for tracking)
router.get("/:orderNumber/track", orderController.getOrderByNumber.bind(orderController));

// Upload payment proof for bank transfer order
router.post(
  "/:orderNumber/payment",
  uploadPaymentReceipt,
  handleMulterError,
  orderController.uploadPaymentProof.bind(orderController)
);

export default router;
