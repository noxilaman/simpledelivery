import type { OrderStatus, Prisma, PrismaClient } from "@prisma/client";

export async function createOrderCode(tx: Prisma.TransactionClient | PrismaClient) {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  const prefix = `ORD-${y}${m}${d}`;

  const count = await tx.order.count({
    where: {
      orderCode: {
        startsWith: prefix,
      },
    },
  });

  return `${prefix}-${String(count + 1).padStart(4, "0")}`;
}

export async function logOrderStatus(
  tx: Prisma.TransactionClient | PrismaClient,
  orderId: string,
  oldStatus: OrderStatus | null,
  newStatus: OrderStatus,
  note?: string,
) {
  return tx.orderStatusLog.create({
    data: {
      orderId,
      oldStatus,
      newStatus,
      note,
    },
  });
}
