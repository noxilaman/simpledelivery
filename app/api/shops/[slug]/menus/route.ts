import { decimalToNumber, fail, handleApiError, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { todayDateOnly } from "@/lib/format";
import { getScheduleState } from "@/lib/schedule";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const shop = await prisma.shop.findFirst({ where: { slug, approvalStatus: "APPROVED" } });
    if (!shop) return fail("ไม่พบร้านค้า", 404);

    const today = todayDateOnly();
    const schedule = await prisma.shopDaySchedule.findUnique({
      where: { shopId_date: { shopId: shop.id, date: today } },
    });
    const state = getScheduleState(schedule);
    if (!state.canViewMenu) return ok([]);

    const menus = await prisma.menu.findMany({
      where: {
        shopId: shop.id,
        availableDate: today,
        isTemplate: false,
        isAvailable: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return ok(decimalToNumber(menus));
  } catch (error) {
    return handleApiError(error);
  }
}
