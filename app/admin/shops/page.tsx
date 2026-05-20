import { redirect } from "next/navigation";
import { decimalToNumber } from "@/lib/api";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminShopManager } from "@/components/admin/AdminShopManager";

export default async function AdminShopsPage() {
  const admin = await getCurrentMerchant();
  if (!admin || admin.role !== "ADMIN") redirect("/admin/login");

  const shops = await prisma.shop.findMany({
    include: {
      owner: { select: { email: true } },
      _count: { select: { menus: true, orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell title="จัดการร้านค้า">
      <AdminShopManager shops={decimalToNumber(shops)} />
    </AdminShell>
  );
}
