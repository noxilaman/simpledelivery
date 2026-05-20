import { decimalToNumber, fail, handleApiError, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ trackingToken: string }> }) {
  try {
    const { trackingToken } = await params;
    const order = await prisma.order.findUnique({
      where: { trackingToken },
      include: {
        shop: { select: { name: true, phone: true } },
        items: true,
        payment: true,
        statusLogs: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!order) return fail("ไม่พบออเดอร์", 404);
    return ok(decimalToNumber(order));
  } catch (error) {
    return handleApiError(error);
  }
}
