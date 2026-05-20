import { redirect } from "next/navigation";
import { decimalToNumber } from "@/lib/api";
import { dateInputToDateOnly, dateOnlyToInput, todayDateOnly } from "@/lib/format";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MerchantShell } from "@/components/merchant/MerchantShell";
import { MenuPlannerClient } from "@/components/merchant/planner/MenuPlannerClient";

function uniqueCatalog<T extends { name: string; price: { toString(): string } }>(menus: T[]) {
  const map = new Map<string, T>();
  for (const menu of menus) {
    const key = `${menu.name}|${menu.price.toString()}`;
    if (!map.has(key)) map.set(key, menu);
  }
  return Array.from(map.values());
}

export default async function MerchantPlannerPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const merchant = await getCurrentMerchant();
  if (!merchant?.shop) redirect("/merchant/login");

  const params = await searchParams;
  const selectedDate = params.date || dateOnlyToInput(todayDateOnly());
  const availableDate = dateInputToDateOnly(selectedDate);

  const [plannedMenus, allMenus, schedule] = await Promise.all([
    prisma.menu.findMany({
      where: { shopId: merchant.shop.id, availableDate },
      orderBy: { createdAt: "desc" },
    }),
    prisma.menu.findMany({
      where: { shopId: merchant.shop.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.shopDaySchedule.findUnique({
      where: { shopId_date: { shopId: merchant.shop.id, date: availableDate } },
    }),
  ]);

  return (
    <MerchantShell title="วางแผนเมนูรายวัน">
      <MenuPlannerClient selectedDate={selectedDate} plannedMenus={decimalToNumber(plannedMenus)} catalog={decimalToNumber(uniqueCatalog(allMenus))} schedule={decimalToNumber(schedule)} />
    </MerchantShell>
  );
}
