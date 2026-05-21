import { redirect } from "next/navigation";
import { decimalToNumber } from "@/lib/api";
import { getCurrentMerchant } from "@/lib/auth";
import { dateInputToDateOnly, dateOnlyToInput, todayDateOnly } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { MerchantShell } from "@/components/merchant/MerchantShell";
import { MenuPlannerClient } from "@/components/merchant/planner/MenuPlannerClient";

export default async function MerchantPlannerPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const merchant = await getCurrentMerchant();
  if (!merchant?.shop) redirect("/merchant/login");

  const params = await searchParams;
  const selectedDate = params.date || dateOnlyToInput(todayDateOnly());
  const availableDate = dateInputToDateOnly(selectedDate);

  const [plannedMenus, catalog, schedule] = await Promise.all([
    prisma.menu.findMany({
      where: { shopId: merchant.shop.id, availableDate, isTemplate: false },
      orderBy: { createdAt: "desc" },
    }),
    prisma.menu.findMany({
      where: { shopId: merchant.shop.id, isTemplate: true, isAvailable: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.shopDaySchedule.findUnique({
      where: { shopId_date: { shopId: merchant.shop.id, date: availableDate } },
    }),
  ]);

  return (
    <MerchantShell title="วางแผนเมนูรายวัน">
      <MenuPlannerClient selectedDate={selectedDate} plannedMenus={decimalToNumber(plannedMenus)} catalog={decimalToNumber(catalog)} schedule={decimalToNumber(schedule)} />
    </MerchantShell>
  );
}
