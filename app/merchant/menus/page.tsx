import { redirect } from "next/navigation";
import { decimalToNumber } from "@/lib/api";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MenuManager } from "@/components/merchant/MenuManager";
import { MerchantShell } from "@/components/merchant/MerchantShell";

export default async function MerchantMenusPage() {
  const merchant = await getCurrentMerchant();
  if (!merchant?.shop) redirect("/merchant/login");

  const menus = await prisma.menu.findMany({
    where: { shopId: merchant.shop.id, isTemplate: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <MerchantShell title="คลังเมนู">
      <MenuManager menus={decimalToNumber(menus)} />
    </MerchantShell>
  );
}
