import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardCheck, Clock, Flame, ReceiptText, Wallet } from "lucide-react";
import { getCurrentMerchant } from "@/lib/auth";
import { formatMoney, thaiDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { MerchantShell } from "@/components/merchant/MerchantShell";

export default async function MerchantDashboardPage() {
  const merchant = await getCurrentMerchant();
  if (!merchant?.shop) redirect("/merchant/login");

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const [orders, pendingSlips, cookingOrders, completedOrders, bestMenus] = await Promise.all([
    prisma.order.findMany({
      where: { shopId: merchant.shop.id, createdAt: { gte: start, lt: end } },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.order.count({ where: { shopId: merchant.shop.id, paymentStatus: "submitted" } }),
    prisma.order.count({ where: { shopId: merchant.shop.id, orderStatus: "cooking" } }),
    prisma.order.count({ where: { shopId: merchant.shop.id, orderStatus: "completed", createdAt: { gte: start, lt: end } } }),
    prisma.menu.findMany({ where: { shopId: merchant.shop.id }, orderBy: { soldQty: "desc" }, take: 5 }),
  ]);

  const salesToday = orders.filter((order) => order.paymentStatus === "verified" || order.orderStatus === "completed").reduce((sum, order) => sum + order.totalPrice.toNumber(), 0);
  const cards = [
    { label: "ออเดอร์วันนี้", value: orders.length, icon: ReceiptText },
    { label: "ยอดขายวันนี้", value: formatMoney(salesToday), icon: Wallet },
    { label: "รอตรวจสลิป", value: pendingSlips, icon: Clock },
    { label: "กำลังทำ", value: cookingOrders, icon: Flame },
    { label: "สำเร็จ", value: completedOrders, icon: ClipboardCheck },
  ];

  return (
    <MerchantShell title={`แดชบอร์ด ${merchant.shop.name}`}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <section key={card.label} className="panel">
              <Icon className="text-leaf" size={22} />
              <p className="mt-3 text-sm text-stone-600">{card.label}</p>
              <p className="mt-1 text-2xl font-bold">{card.value}</p>
            </section>
          );
        })}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
        <section className="panel">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">ออเดอร์ล่าสุด</h2>
            <Link href="/merchant/orders" className="font-semibold text-leaf">ดูทั้งหมด</Link>
          </div>
          <div className="space-y-3">
            {orders.map((order) => (
              <Link key={order.id} href={`/merchant/orders/${order.id}`} className="block rounded-lg border border-stone-200 p-3">
                <div className="flex justify-between gap-3">
                  <strong>{order.orderCode}</strong>
                  <span className="text-chili font-bold">{formatMoney(order.totalPrice.toNumber())}</span>
                </div>
                <p className="mt-1 text-sm text-stone-600">{order.customerName} - {thaiDate(order.createdAt)}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2 className="mb-3 font-bold">เมนูขายดีที่สุด</h2>
          <div className="space-y-3">
            {bestMenus.map((menu, index) => (
              <div key={menu.id} className="flex justify-between rounded-lg bg-stone-50 p-3">
                <span>{index + 1}. {menu.name}</span>
                <strong>{menu.soldQty} กล่อง</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </MerchantShell>
  );
}
