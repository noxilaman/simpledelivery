import { PaymentStatus } from "@prisma/client";
import { decimalToNumber, handleApiError, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const [shopsTotal, pendingShops, approvedShops, rejectedShops, ordersToday, allOrders, recentShops, topShops] = await Promise.all([
      prisma.shop.count(),
      prisma.shop.count({ where: { approvalStatus: "PENDING" } }),
      prisma.shop.count({ where: { approvalStatus: "APPROVED" } }),
      prisma.shop.count({ where: { approvalStatus: "REJECTED" } }),
      prisma.order.count({ where: { createdAt: { gte: start, lt: end } } }),
      prisma.order.findMany({ where: { paymentStatus: PaymentStatus.verified }, select: { totalPrice: true } }),
      prisma.shop.findMany({ include: { owner: { select: { email: true } } }, orderBy: { createdAt: "desc" }, take: 8 }),
      prisma.shop.findMany({
        where: { approvalStatus: "APPROVED" },
        include: { _count: { select: { orders: true, menus: true } } },
        orderBy: { orders: { _count: "desc" } },
        take: 6,
      }),
    ]);

    const totalSales = allOrders.reduce((sum, order) => sum + order.totalPrice.toNumber(), 0);

    return ok(decimalToNumber({ shopsTotal, pendingShops, approvedShops, rejectedShops, ordersToday, totalSales, recentShops, topShops }));
  } catch (error) {
    return handleApiError(error);
  }
}
