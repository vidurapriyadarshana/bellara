import { prisma } from "@/lib/prisma";
import { ORDER_CONFIG } from "@/constants/order";

/**
 * Generate unique order number in format: BLR-YYYYMMDD-XXX
 * XXX is a 3-digit sequence number that increments per day
 *
 * @returns Promise with generated order number
 */
export async function generateUniqueOrderNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

  // Create date range for today
  const startOfDay = new Date(year, now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(year, now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Count orders created today
  const ordersCreatedToday = await prisma.order.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  // Next sequence number (001, 002, etc.)
  const sequence = ordersCreatedToday + 1;
  const sequenceStr = String(sequence).padStart(3, "0");

  const orderNumber = `${ORDER_CONFIG.ORDER_NUMBER_PREFIX}-${dateStr}-${sequenceStr}`;

  return orderNumber;
}

/**
 * Validate order number format
 * Format: BLR-YYYYMMDD-XXX
 *
 * @param orderNumber - Order number to validate
 * @returns boolean indicating if format is valid
 */
export function isValidOrderNumberFormat(orderNumber: string): boolean {
  const pattern = /^BLR-\d{8}-\d{3}$/;
  return pattern.test(orderNumber);
}

/**
 * Extract date from order number
 * Format: BLR-YYYYMMDD-XXX
 *
 * @param orderNumber - Order number to parse
 * @returns Date object or null if invalid format
 */
export function extractDateFromOrderNumber(orderNumber: string): Date | null {
  if (!isValidOrderNumberFormat(orderNumber)) {
    return null;
  }

  const dateStr = orderNumber.split("-")[1]; // YYYYMMDD
  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10) - 1; // Month is 0-indexed
  const day = parseInt(dateStr.substring(6, 8), 10);

  return new Date(year, month, day);
}
