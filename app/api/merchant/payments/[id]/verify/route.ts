import { OrderStatus, PaymentStatus } from "@prisma/client";
import { decimalToNumber, handleApiError, ok } from "@/lib/api";
import { requireMerchant } from "@/lib/auth";
import { awardCampaignPoints } from "@/lib/campaigns";
import { logOrderStatus } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const merchant = await requireMerchant();
    const { id } = await params;
    const payment = await prisma.$transaction(async (tx) => {
      const current = await tx.payment.findFirst({
        where: { id, order: { shopId: merchant.shop!.id } },
        include: { order: true },
      });
      if (!current) throw new Error("ไม่พบรายการชำระเงิน");

      const updated = await tx.payment.update({
        where: { id },
        data: { status: PaymentStatus.verified, verifiedAt: new Date() },
        include: { order: true },
      });
      await tx.order.update({
        where: { id: current.orderId },
        data: { paymentStatus: PaymentStatus.verified, orderStatus: OrderStatus.payment_verified },
      });
      await logOrderStatus(tx, current.orderId, current.order.orderStatus, OrderStatus.payment_verified, "ร้านยืนยันการชำระเงิน");
      await awardCampaignPoints(tx, current.orderId);
      return updated;
    });

    return ok(decimalToNumber(payment));
  } catch (error) {
    return handleApiError(error);
  }
}
