import { OrderStatus, PaymentStatus } from "@prisma/client";
import { decimalToNumber, handleApiError, ok } from "@/lib/api";
import { requireMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const merchant = await requireMerchant();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const [todayOrders, pendingSlips, cookingOrders, completedOrders, bestMenus, memberCount, pointSummary] = await Promise.all([
      prisma.order.findMany({
        where: { shopId: merchant.shop!.id, createdAt: { gte: start, lt: end } },
        include: { items: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where: { shopId: merchant.shop!.id, paymentStatus: PaymentStatus.submitted } }),
      prisma.order.count({ where: { shopId: merchant.shop!.id, orderStatus: OrderStatus.cooking } }),
      prisma.order.count({
        where: { shopId: merchant.shop!.id, orderStatus: OrderStatus.completed, createdAt: { gte: start, lt: end } },
      }),
      prisma.menu.findMany({
        where: { shopId: merchant.shop!.id },
        orderBy: { soldQty: "desc" },
        take: 5,
      }),
      prisma.customerMember.count({ where: { shopId: merchant.shop!.id } }),
      prisma.pointLedger.aggregate({ where: { shopId: merchant.shop!.id }, _sum: { points: true } }),
    ]);

    const salesToday = todayOrders
      .filter((order) => order.paymentStatus === PaymentStatus.verified || order.orderStatus === OrderStatus.completed)
      .reduce((sum, order) => sum + order.totalPrice.toNumber(), 0);

    return ok(decimalToNumber({
      todayOrders: todayOrders.length,
      salesToday,
      pendingSlips,
      cookingOrders,
      completedOrders,
      memberCount,
      totalMemberPoints: pointSummary._sum.points ?? 0,
      bestMenus,
      recentOrders: todayOrders.slice(0, 8),
    }));
  } catch (error) {
    return handleApiError(error);
  }
}
