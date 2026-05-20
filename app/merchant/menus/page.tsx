import { redirect } from "next/navigation";
import { decimalToNumber } from "@/lib/api";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MerchantShell } from "@/components/merchant/MerchantShell";
import { MenuManager } from "@/components/merchant/MenuManager";

export default async function MerchantMenusPage() {
  const merchant = await getCurrentMerchant();
  if (!merchant?.shop) redirect("/merchant/login");

  const menus = await prisma.menu.findMany({
    where: { shopId: merchant.shop.id },
    orderBy: [{ availableDate: "desc" }, { createdAt: "desc" }],
  });

  return (
    <MerchantShell title="จัดการเมนู">
      <MenuManager menus={decimalToNumber(menus)} />
    </MerchantShell>
  );
}
