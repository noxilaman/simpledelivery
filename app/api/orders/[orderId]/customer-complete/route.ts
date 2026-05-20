import { OrderStatus } from "@prisma/client";
import { decimalToNumber, handleApiError, ok } from "@/lib/api";
import { logOrderStatus } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    const order = await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({ where: { id: orderId } });
      if (!current) throw new Error("ไม่พบออเดอร์");

      const updated = await tx.order.update({
        where: { id: orderId },
        data: { orderStatus: OrderStatus.completed },
        include: { items: true, statusLogs: true },
      });
      await logOrderStatus(tx, orderId, current.orderStatus, OrderStatus.completed, "ลูกค้ายืนยันว่าได้รับอาหารแล้ว");
      return updated;
    });

    return ok(decimalToNumber(order));
  } catch (error) {
    return handleApiError(error);
  }
}
