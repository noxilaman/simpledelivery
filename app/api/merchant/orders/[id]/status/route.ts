import { OrderStatus } from "@prisma/client";
import { decimalToNumber, fail, handleApiError, ok } from "@/lib/api";
import { requireMerchant } from "@/lib/auth";
import { logOrderStatus } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const merchant = await requireMerchant();
    const { id } = await params;
    const body = await request.json();
    const newStatus = body.orderStatus as OrderStatus;
    if (!Object.values(OrderStatus).includes(newStatus)) return fail("สถานะไม่ถูกต้อง", 422);

    const order = await prisma.$transaction(async (tx) => {
      const current = await tx.order.findFirst({ where: { id, shopId: merchant.shop!.id } });
      if (!current) throw new Error("ไม่พบออเดอร์");

      const updated = await tx.order.update({
        where: { id },
        data: { orderStatus: newStatus },
        include: { items: true, payment: true, statusLogs: true },
      });
      await logOrderStatus(tx, id, current.orderStatus, newStatus, body.note);
      return updated;
    });

    return ok(decimalToNumber(order));
  } catch (error) {
    return handleApiError(error);
  }
}
