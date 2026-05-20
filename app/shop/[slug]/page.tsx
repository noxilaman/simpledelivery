import { notFound } from "next/navigation";
import { decimalToNumber } from "@/lib/api";
import { todayDateOnly } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { ShopMenuClient } from "@/components/public/ShopMenuClient";
import { getScheduleState } from "@/lib/schedule";

export default async function ShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shop = await prisma.shop.findFirst({ where: { slug, approvalStatus: "APPROVED" } });
  if (!shop) notFound();

  const today = todayDateOnly();
  const schedule = await prisma.shopDaySchedule.findUnique({
    where: { shopId_date: { shopId: shop.id, date: today } },
  });
  const scheduleState = shop.isOpen
    ? getScheduleState(schedule)
    : { canViewMenu: true, canOrder: false, message: "ร้านปิดรับออเดอร์อยู่" };

  const menus = scheduleState.canViewMenu ? await prisma.menu.findMany({
    where: {
      shopId: shop.id,
      availableDate: today,
      isAvailable: true,
    },
    orderBy: { createdAt: "desc" },
  }) : [];

  return <ShopMenuClient shop={decimalToNumber(shop)} menus={decimalToNumber(menus)} ordering={scheduleState} />;
}
