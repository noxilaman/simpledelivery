import { decimalToNumber, handleApiError, ok } from "@/lib/api";
import { requireMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const merchant = await requireMerchant();
    const url = new URL(request.url);
    const todayOnly = url.searchParams.get("today") !== "false";
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const orders = await prisma.order.findMany({
      where: {
        shopId: merchant.shop!.id,
        ...(todayOnly ? { createdAt: { gte: start, lt: end } } : {}),
      },
      include: { items: true, payment: true },
      orderBy: { createdAt: "desc" },
    });

    return ok(decimalToNumber(orders));
  } catch (error) {
    return handleApiError(error);
  }
}
