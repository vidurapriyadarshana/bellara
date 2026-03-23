import { z } from "zod";
import { PaymentMethod, OrderStatus, PaymentStatus } from "@prisma/client";
import { ORDER_CONFIG } from "@/constants/order";

/**
 * Cart item validation
 */
export const cartItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  name: z.string().min(1, "Product name is required"),
  price: z.number().positive("Product price must be positive"),
  image: z.string().nullable().optional(),
  quantity: z
    .number("Quantity must be a number")
    .int("Quantity must be an integer")
    .refine(
      (qty) => qty >= ORDER_CONFIG.MIN_QUANTITY && qty <= ORDER_CONFIG.MAX_QUANTITY,
      `Quantity must be between ${ORDER_CONFIG.MIN_QUANTITY} and ${ORDER_CONFIG.MAX_QUANTITY}`
    ),
});

export type CartItem = z.infer<typeof cartItemSchema>;

/**
 * Customer details validation
 */
export const customerDetailsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[0-9\s\-()]{8,20}$/, "Invalid phone number format"),
  email: z.string().email("Invalid email address"),
  street: z
    .string()
    .trim()
    .min(5, "Street address must be at least 5 characters")
    .max(255, "Street address cannot exceed 255 characters"),
  district: z
    .string()
    .trim()
    .min(2, "District must be at least 2 characters")
    .max(100, "District cannot exceed 100 characters"),
  city: z
    .string()
    .trim()
    .min(2, "City must be at least 2 characters")
    .max(100, "City cannot exceed 100 characters"),
  country: z
    .string()
    .trim()
    .min(2, "Country must be at least 2 characters")
    .max(100, "Country cannot exceed 100 characters")
    .optional()
    .default("Sri Lanka"),
});

export type CustomerDetails = z.infer<typeof customerDetailsSchema>;

/**
 * Billing details validation
 */
export const billingDetailsSchema = z.object({
  paymentMethod: z.enum([
    PaymentMethod.CASH_ON_DELIVERY,
    PaymentMethod.BANK_TRANSFER,
  ] as const),
});

export type BillingDetails = z.infer<typeof billingDetailsSchema>;

/**
 * Create order request validation
 */
export const createOrderSchema = z.object({
  items: z
    .array(cartItemSchema)
    .min(1, "At least one item is required in the cart")
    .max(100, "Cannot have more than 100 items in one order"),
  customer: customerDetailsSchema,
  billing: billingDetailsSchema,
  notes: z
    .string()
    .trim()
    .max(1000, "Notes cannot exceed 1000 characters")
    .optional(),
});

export type CreateOrderRequest = z.infer<typeof createOrderSchema>;

/**
 * Order number format validation (for tracking)
 */
export const orderNumberSchema = z
  .string()
  .regex(/^BLR-\d{8}-\d{3}$/, "Invalid order number format (expected BLR-YYYYMMDD-XXX)");

export type OrderNumber = z.infer<typeof orderNumberSchema>;

/**
 * Pagination validation
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= ORDER_CONFIG.DEFAULT_PAGE, "Invalid page number"),
  limit: z
    .string()
    .optional()
    .default(ORDER_CONFIG.DEFAULT_LIMIT.toString())
    .transform((val) => parseInt(val, 10))
    .refine(
      (val) => !isNaN(val) && val >= ORDER_CONFIG.MIN_LIMIT && val <= ORDER_CONFIG.MAX_LIMIT,
      `Limit must be between ${ORDER_CONFIG.MIN_LIMIT} and ${ORDER_CONFIG.MAX_LIMIT}`
    ),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

/**
 * Payment proof upload validation
 */
export const uploadPaymentProofSchema = z.object({
  bankName: z
    .string()
    .trim()
    .min(2, "Bank name must be at least 2 characters")
    .max(100, "Bank name cannot exceed 100 characters"),
  transferDate: z
    .string()
    .datetime("Invalid date format. Expected ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)"),
  amount: z.number().positive("Payment amount must be positive"),
});

export type UploadPaymentProofRequest = z.infer<typeof uploadPaymentProofSchema>;

/**
 * List orders filter validation (admin)
 */
export const listOrdersFilterSchema = z.object({
  status: z
    .enum([
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
      OrderStatus.PACKAGED,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
      OrderStatus.CANCELLED,
    ])
    .optional(),
  paymentMethod: z
    .enum([PaymentMethod.CASH_ON_DELIVERY, PaymentMethod.BANK_TRANSFER])
    .optional(),
  paymentStatus: z
    .enum([PaymentStatus.PENDING, PaymentStatus.PAID, PaymentStatus.FAILED, PaymentStatus.REFUNDED])
    .optional(),
  startDate: z
    .string()
    .datetime("Invalid date format. Expected ISO 8601 format")
    .optional(),
  endDate: z
    .string()
    .datetime("Invalid date format. Expected ISO 8601 format")
    .optional(),
  searchTerm: z
    .string()
    .trim()
    .max(255, "Search term cannot exceed 255 characters")
    .optional(),
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= ORDER_CONFIG.DEFAULT_PAGE, "Invalid page number"),
  limit: z
    .string()
    .optional()
    .default(ORDER_CONFIG.DEFAULT_LIMIT.toString())
    .transform((val) => parseInt(val, 10))
    .refine(
      (val) => !isNaN(val) && val >= ORDER_CONFIG.MIN_LIMIT && val <= ORDER_CONFIG.MAX_LIMIT,
      `Limit must be between ${ORDER_CONFIG.MIN_LIMIT} and ${ORDER_CONFIG.MAX_LIMIT}`
    ),
});

export type ListOrdersFilterInput = z.infer<typeof listOrdersFilterSchema>;

/**
 * Update order status validation (admin)
 */
export const updateOrderStatusSchema = z.object({
  status: z.enum([
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.PROCESSING,
    OrderStatus.PACKAGED,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
  ]),
  note: z
    .string()
    .trim()
    .max(1000, "Note cannot exceed 1000 characters")
    .optional(),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

/**
 * Add tracking code validation (admin)
 */
export const addTrackingCodeSchema = z.object({
  trackingCode: z
    .string()
    .trim()
    .min(5, "Tracking code must be at least 5 characters")
    .max(100, "Tracking code cannot exceed 100 characters"),
  courierName: z
    .string()
    .trim()
    .min(2, "Courier name must be at least 2 characters")
    .max(100, "Courier name cannot exceed 100 characters"),
  note: z
    .string()
    .trim()
    .max(1000, "Note cannot exceed 1000 characters")
    .optional(),
});

export type AddTrackingCodeInput = z.infer<typeof addTrackingCodeSchema>;
