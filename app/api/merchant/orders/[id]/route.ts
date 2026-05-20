import { decimalToNumber, fail, handleApiError, ok } from "@/lib/api";
import { requireMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const merchant = await requireMerchant();
    const { id } = await params;
    const order = await prisma.order.findFirst({
      where: { id, shopId: merchant.shop!.id },
      include: { items: true, payment: true, statusLogs: { orderBy: { createdAt: "asc" } } },
    });
    if (!order) return fail("ไม่พบออเดอร์", 404);
    return ok(decimalToNumber(order));
  } catch (error) {
    return handleApiError(error);
  }
}
