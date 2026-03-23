import type { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

/**
 * Request types for order operations
 */

/**
 * Cart item from frontend (localStorage)
 * Sent with checkout request
 */
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
}

/**
 * Customer details from checkout form
 */
export interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  street: string;
  district: string;
  city: string;
  country?: string;
}

/**
 * Billing details (payment method selection)
 */
export interface BillingDetails {
  paymentMethod: PaymentMethod;
}

/**
 * Create Order Request DTO
 * Sent from frontend with cart items and customer details
 */
export interface CreateOrderRequest {
  items: CartItem[];
  customer: CustomerDetails;
  billing: BillingDetails;
  notes?: string;
}

/**
 * Response types
 */

/**
 * Order item in response
 */
export interface OrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string | null;
  quantity: number;
  total: number;
  createdAt: string;
}

/**
 * Order response (minimal - list/summary)
 */
export interface OrderSummaryResponse {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  customerName: string;
  customerEmail: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

/**
 * Order response (full details)
 */
export interface OrderDetailResponse extends OrderSummaryResponse {
  customerPhone: string;
  shippingStreet: string;
  shippingDistrict: string;
  shippingCity: string;
  shippingCountry: string;
  trackingCode: string | null;
  courierName: string | null;
  notes: string | null;
  items: OrderItemResponse[];
  updatedAt: string;
}

/**
 * Create Order Response
 * Returned after successful checkout
 */
export interface CreateOrderResponse {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

/**
 * Order calculation result (internal use)
 */
export interface OrderCalculation {
  subtotal: number;
  shippingFee: number;
  total: number;
}

/**
 * Order number generation result
 */
export interface OrderNumberResult {
  orderNumber: string;
  sequence: number;
}

/**
 * Payment Proof Request DTO
 * Sent when uploading bank transfer payment proof
 */
export interface UploadPaymentProofRequest {
  bankName: string;
  transferDate: string; // ISO date string
  amount: number;
  // File is uploaded via multipart form-data (handled by multer middleware)
}

/**
 * Payment Proof Response
 */
export interface PaymentProofResponse {
  id: string;
  orderId: string;
  imagePath: string;
  bankName: string | null;
  transferDate: string | null;
  amount: number | null;
  createdAt: string;
}

/**
 * Payment Proof metadata (internal use)
 */
export interface PaymentProofMetadata {
  orderId: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
}
