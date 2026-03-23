import { prisma } from "@/lib/prisma";
import { generateUniqueOrderNumber } from "@/utils/order";
import { ORDER_CONFIG, ORDER_MESSAGES, HTTP_STATUS } from "@/constants/order";
import type {
  CreateOrderRequest,
  OrderCalculation,
  CreateOrderResponse,
  OrderDetailResponse,
  OrderSummaryResponse,
  PaymentProofResponse,
  UploadPaymentProofRequest,
  UpdateOrderStatusResponse,
  OrderStatusHistoryResponse,
  AddTrackingCodeResponse,
} from "@/types/order";
import type { OrderStatus, PaymentMethod } from "@prisma/client";

/**
 * Order Service
 * Handles all order operations (creation, retrieval, updates)
 */
export class OrderService {
  /**
   * Calculate order totals based on cart items
   * @param subtotal - Order subtotal
   * @returns Order calculation with shipping fee and total
   */
  static calculateOrderTotals(subtotal: number): OrderCalculation {
    const shippingFee = ORDER_CONFIG.SHIPPING_FEE;
    const total = subtotal + shippingFee;

    return {
      subtotal,
      shippingFee,
      total,
    };
  }

  /**
   * Validate cart items and check product availability
   * @param items - Cart items with productId and quantity
   * @returns Promise with validation result and item details
   */
  static async validateCartItems(
    items: Array<{ productId: string; quantity: number }>
  ): Promise<
    Array<{ productId: string; quantity: number; price: number; primaryImage: string | null }>
  > {
    if (!items || items.length === 0) {
      const error = new Error(ORDER_MESSAGES.CART_EMPTY);
      (error as any).statusCode = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    // Get all products in one query
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: items.map((item) => item.productId),
        },
      },
      include: {
        images: {
          where: { isPrimary: true },
          select: { imagePath: true },
        },
      },
    });

    // Check if all products exist
    if (products.length !== items.length) {
      const error = new Error(ORDER_MESSAGES.PRODUCT_NOT_FOUND);
      (error as any).statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // Check stock and active status for each product
    const validatedItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);

      if (!product) {
        const error = new Error(ORDER_MESSAGES.PRODUCT_NOT_FOUND);
        (error as any).statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      if (!product.isActive) {
        const error = new Error(ORDER_MESSAGES.PRODUCT_INACTIVE);
        (error as any).statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
        throw error;
      }

      if (product.stock < item.quantity) {
        const error = new Error(
          `${ORDER_MESSAGES.INSUFFICIENT_STOCK}: ${product.name} (available: ${product.stock})`
        );
        (error as any).statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
        throw error;
      }

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: Number(product.price),
        primaryImage: product.images[0]?.imagePath || null,
      };
    });

    return validatedItems;
  }

  /**
   * Create a new order
   * @param request - Create order request with items, customer, and billing info
   * @returns Created order with order number
   */
  static async createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      // Validate and get product details
      const validatedItems = await this.validateCartItems(
        request.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }))
      );

      // Calculate subtotal from original cart items (use cart prices)
      let subtotal = 0;
      request.items.forEach((item) => {
        subtotal += item.price * item.quantity;
      });

      // Calculate order totals
      const { shippingFee, total } = this.calculateOrderTotals(subtotal);

      // Generate unique order number
      const orderNumber = await generateUniqueOrderNumber();

      // Create order with items in a transaction
      const order = await prisma.order.create({
        data: {
          orderNumber,
          status: "PENDING",
          customerName: request.customer.name,
          customerPhone: request.customer.phone,
          customerEmail: request.customer.email,
          shippingStreet: request.customer.street,
          shippingDistrict: request.customer.district,
          shippingCity: request.customer.city,
          shippingCountry: request.customer.country || "Sri Lanka",
          subtotal,
          shippingFee,
          total,
          paymentMethod: request.billing.paymentMethod as PaymentMethod,
          paymentStatus: "PENDING",
          notes: request.notes || null,

          // Create order items
          items: {
            create: request.items.map((item) => {
              const validatedItem = validatedItems.find((v) => v.productId === item.productId);
              if (!validatedItem) {
                throw new Error("Item validation mismatch");
              }

              return {
                productId: item.productId,
                productName: item.name,
                productPrice: item.price,
                productImage: validatedItem.primaryImage,
                quantity: item.quantity,
                total: item.price * item.quantity,
              };
            }),
          },

          // Create initial status history (PENDING status created automatically)
          statusHistory: {
            create: [
              {
                status: "PENDING" as OrderStatus,
                note: "Order placed by customer",
              },
            ],
          },
        },
        include: {
          items: true,
        },
      });

      // Decrement product stock (don't wait for this)
      Promise.all(
        validatedItems.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        )
      ).catch((err) => console.error("Error updating product stock:", err));

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: Number(order.total),
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt.toISOString(),
      };
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }

      const err = new Error(error.message || ORDER_MESSAGES.FAILED_TO_CREATE);
      (err as any).statusCode = HTTP_STATUS.INTERNAL_ERROR;
      throw err;
    }
  }

  /**
   * Get order by order number (public - limited info)
   * @param orderNumber - Order number to retrieve
   * @returns Order details with limited customer information
   */
  static async getOrderByNumber(orderNumber: string): Promise<OrderDetailResponse> {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        statusHistory: {
          orderBy: { createdAt: "asc" },
          select: {
            status: true,
            note: true,
            createdAt: true,
          },
        },
      },
    });

    if (!order) {
      const error = new Error(ORDER_MESSAGES.ORDER_NOT_FOUND);
      (error as any).statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      shippingStreet: order.shippingStreet,
      shippingDistrict: order.shippingDistrict,
      shippingCity: order.shippingCity,
      shippingCountry: order.shippingCountry,
      subtotal: Number(order.subtotal),
      shippingFee: Number(order.shippingFee),
      total: Number(order.total),
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      trackingCode: order.trackingCode,
      courierName: order.courierName,
      notes: order.notes,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productPrice: Number(item.productPrice),
        productImage: item.productImage,
        quantity: item.quantity,
        total: Number(item.total),
        createdAt: item.createdAt.toISOString(),
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }

  /**
   * Get order by ID (admin only)
   * @param orderId - Order ID (UUID)
   * @returns Full order details with items
   */
  static async getOrderById(orderId: string): Promise<OrderDetailResponse> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        statusHistory: {
          orderBy: { createdAt: "asc" },
          select: {
            status: true,
            note: true,
            createdAt: true,
          },
        },
      },
    });

    if (!order) {
      const error = new Error(ORDER_MESSAGES.ORDER_NOT_FOUND);
      (error as any).statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      shippingStreet: order.shippingStreet,
      shippingDistrict: order.shippingDistrict,
      shippingCity: order.shippingCity,
      shippingCountry: order.shippingCountry,
      subtotal: Number(order.subtotal),
      shippingFee: Number(order.shippingFee),
      total: Number(order.total),
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      trackingCode: order.trackingCode,
      courierName: order.courierName,
      notes: order.notes,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productPrice: Number(item.productPrice),
        productImage: item.productImage,
        quantity: item.quantity,
        total: Number(item.total),
        createdAt: item.createdAt.toISOString(),
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }

  /**
   * List orders (admin only)
   * @param page - Page number
   * @param limit - Items per page
   * @returns Paginated orders list
   */
   /**
    * List orders with filtering and pagination (admin only)
    * @param page - Page number for pagination
    * @param limit - Items per page
    * @param filters - Optional filters (status, paymentMethod, paymentStatus, date range, search term)
    * @returns Paginated and filtered orders list
    */
  static async listOrders(
    page: number,
    limit: number,
    filters?: {
      status?: OrderStatus;
      paymentMethod?: PaymentMethod;
      paymentStatus?: string;
      startDate?: string;
      endDate?: string;
      searchTerm?: string;
    }
  ): Promise<{
    data: OrderSummaryResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.paymentMethod) {
      where.paymentMethod = filters.paymentMethod;
    }

    if (filters?.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }

    // Date range filtering
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters?.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters?.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    // Search term filtering (search in customer name or email)
    if (filters?.searchTerm) {
      where.OR = [
        { customerName: { contains: filters.searchTerm } },
        { customerEmail: { contains: filters.searchTerm } },
        { orderNumber: { contains: filters.searchTerm } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          subtotal: true,
          shippingFee: true,
          total: true,
          customerName: true,
          customerEmail: true,
          paymentMethod: true,
          paymentStatus: true,
          createdAt: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        subtotal: Number(order.subtotal),
        shippingFee: Number(order.shippingFee),
        total: Number(order.total),
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Upload payment proof for a bank transfer order
   * @param orderNumber - Order number
   * @param proofData - Payment proof details (bank name, transfer date, amount)
   * @param filePath - Path to uploaded file (relative to upload directory)
   * @returns Payment proof response
   */
  static async uploadPaymentProof(
    orderNumber: string,
    proofData: UploadPaymentProofRequest,
    filePath: string
  ): Promise<PaymentProofResponse> {
    // Get order
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: {
        id: true,
        paymentMethod: true,
        total: true,
        paymentProofs: true,
      },
    });

    if (!order) {
      const error = new Error(ORDER_MESSAGES.ORDER_NOT_FOUND);
      (error as any).statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // Verify order is for bank transfer
    if (order.paymentMethod !== "BANK_TRANSFER") {
      const error = new Error("Payment proof can only be uploaded for bank transfer orders");
      (error as any).statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
      throw error;
    }

    // Check if proof already exists
    if (order.paymentProofs && order.paymentProofs.length > 0) {
      const error = new Error(ORDER_MESSAGES.PROOF_ALREADY_UPLOADED);
      (error as any).statusCode = HTTP_STATUS.CONFLICT;
      throw error;
    }

    // Verify amount matches or is within reasonable range (±5% tolerance for currency conversion, fees, etc.)
    const orderTotal = Number(order.total);
    const proofAmount = proofData.amount;
    const percentDifference = Math.abs((proofAmount - orderTotal) / orderTotal) * 100;

    if (percentDifference > 5) {
      const error = new Error(
        `Payment amount (${proofAmount}) does not match order total (${orderTotal}). Difference exceeds 5%.`
      );
      (error as any).statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
      throw error;
    }

    // Create payment proof record
    const paymentProof = await prisma.paymentProof.create({
      data: {
        orderId: order.id,
        imagePath: filePath,
        bankName: proofData.bankName,
        transferDate: new Date(proofData.transferDate),
        amount: proofData.amount,
      },
    });

    return {
      id: paymentProof.id,
      orderId: paymentProof.orderId,
      imagePath: paymentProof.imagePath,
      bankName: paymentProof.bankName,
      transferDate: paymentProof.transferDate?.toISOString() || null,
      amount: paymentProof.amount ? Number(paymentProof.amount) : null,
      createdAt: paymentProof.createdAt.toISOString(),
    };
  }

  /**
   * Update order status (admin only)
   * @param orderId - Order ID
   * @param newStatus - New status to set
   * @param note - Optional admin note about the status change
   * @param adminId - Admin ID making the change
   * @returns Updated order status response
   */
  static async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    adminId?: string
  ): Promise<UpdateOrderStatusResponse> {
    // Get current order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
      },
    });

    if (!order) {
      const error = new Error(ORDER_MESSAGES.ORDER_NOT_FOUND);
      (error as any).statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // Validate status transition
    const validTransitions = (ORDER_CONFIG.STATUS_TRANSITIONS[order.status as OrderStatus] || []) as OrderStatus[];
    if (!validTransitions.includes(newStatus)) {
      const error = new Error(
        `Cannot transition from ${order.status} to ${newStatus}. Valid transitions: ${validTransitions.join(", ") || "None (final state)"}`
      );
      (error as any).statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
      throw error;
    }

    // Update order status and create history entry
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
        statusHistory: {
          create: {
            status: newStatus,
            note: note || null,
            adminId: adminId || null,
          },
        },
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        updatedAt: true,
      },
    });

    return {
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      previousStatus: order.status,
      newStatus: updatedOrder.status,
      updatedAt: updatedOrder.updatedAt.toISOString(),
    };
  }

  /**
   * Add tracking code and courier information (admin only)
   * @param orderId - Order ID
   * @param trackingCode - Tracking code from courier
   * @param courierName - Name of courier service
   * @param note - Optional admin note
   * @param adminId - Admin ID making the change
   * @returns Updated order with tracking info
   */
  static async addTrackingCode(
    orderId: string,
    trackingCode: string,
    courierName: string,
    note?: string,
    adminId?: string
  ): Promise<AddTrackingCodeResponse> {
    // Get current order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
      },
    });

    if (!order) {
      const error = new Error(ORDER_MESSAGES.ORDER_NOT_FOUND);
      (error as any).statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // Update order with tracking info
    const updateData: any = {
      trackingCode,
      courierName,
      updatedAt: new Date(),
    };

    // Add status history entry only if note is provided
    if (note) {
      updateData.statusHistory = {
        create: {
          status: order.status,
          note: `Tracking added: ${note}`,
          adminId: adminId || null,
        },
      };
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      select: {
        id: true,
        orderNumber: true,
        trackingCode: true,
        courierName: true,
        updatedAt: true,
      },
    });

    return {
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      trackingCode: updatedOrder.trackingCode || "",
      courierName: updatedOrder.courierName || "",
      updatedAt: updatedOrder.updatedAt.toISOString(),
    };
  }

  /**
   * Get order status history (admin only)
   * @param orderId - Order ID
   * @returns Order status history with all transitions
   */
  static async getOrderStatusHistory(orderId: string): Promise<OrderStatusHistoryResponse> {
    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        statusHistory: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            status: true,
            note: true,
            createdAt: true,
            admin: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      const error = new Error(ORDER_MESSAGES.ORDER_NOT_FOUND);
      (error as any).statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      currentStatus: order.status,
      history: order.statusHistory.map((entry) => ({
        id: entry.id,
        status: entry.status,
        note: entry.note,
        createdAt: entry.createdAt.toISOString(),
        adminName: entry.admin?.name,
      })),
    };
  }
}
