import { OrderStatus, PaymentStatus } from "@prisma/client";
import { decimalToNumber, fail, handleApiError, ok } from "@/lib/api";
import { logOrderStatus } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { saveImageUpload } from "@/lib/upload";

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    const form = await request.formData();
    const file = form.get("slip");
    if (!(file instanceof File)) return fail("กรุณาอัปโหลดสลิป", 422);

    const slipImageUrl = await saveImageUpload(file, "slips");
    const order = await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({ where: { id: orderId }, include: { payment: true } });
      if (!current) throw new Error("ไม่พบออเดอร์");

      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.submitted,
          orderStatus: OrderStatus.payment_submitted,
          payment: {
            upsert: {
              create: { amount: current.totalPrice, slipImageUrl, status: PaymentStatus.submitted },
              update: { slipImageUrl, status: PaymentStatus.submitted, verifiedAt: null },
            },
          },
        },
        include: { items: true, payment: true },
      });
      await logOrderStatus(tx, orderId, current.orderStatus, OrderStatus.payment_submitted, "ลูกค้าอัปโหลดสลิป");
      return updated;
    });

    return ok(decimalToNumber(order));
  } catch (error) {
    return handleApiError(error);
  }
}
