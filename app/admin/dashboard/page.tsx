import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList, Clock, Store, StoreIcon, Wallet, XCircle } from "lucide-react";
import { getCurrentMerchant } from "@/lib/auth";
import { formatMoney, thaiDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminDashboardPage() {
  const admin = await getCurrentMerchant();
  if (!admin || admin.role !== "ADMIN") redirect("/admin/login");

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const [shopsTotal, pendingShops, approvedShops, rejectedShops, ordersToday, verifiedOrders, recentShops, topShops] = await Promise.all([
    prisma.shop.count(),
    prisma.shop.count({ where: { approvalStatus: "PENDING" } }),
    prisma.shop.count({ where: { approvalStatus: "APPROVED" } }),
    prisma.shop.count({ where: { approvalStatus: "REJECTED" } }),
    prisma.order.count({ where: { createdAt: { gte: start, lt: end } } }),
    prisma.order.findMany({ where: { paymentStatus: "verified" }, select: { totalPrice: true } }),
    prisma.shop.findMany({ include: { owner: { select: { email: true } } }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.shop.findMany({ include: { _count: { select: { orders: true, menus: true } } }, orderBy: { orders: { _count: "desc" } }, take: 6 }),
  ]);

  const totalSales = verifiedOrders.reduce((sum, order) => sum + order.totalPrice.toNumber(), 0);
  const cards = [
    { label: "ร้านทั้งหมด", value: shopsTotal, icon: Store },
    { label: "รออนุมัติ", value: pendingShops, icon: Clock },
    { label: "อนุมัติแล้ว", value: approvedShops, icon: StoreIcon },
    { label: "ไม่อนุมัติ", value: rejectedShops, icon: XCircle },
    { label: "ออเดอร์วันนี้", value: ordersToday, icon: ClipboardList },
    { label: "ยอดขายรวมที่ยืนยันแล้ว", value: formatMoney(totalSales), icon: Wallet },
  ];

  return (
    <AdminShell title="Dashboard รวมระบบ">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_380px]">
        <section className="panel">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">ร้านที่สมัครล่าสุด</h2>
            <Link href="/admin/shops" className="font-semibold text-leaf">จัดการร้านค้า</Link>
          </div>
          <div className="space-y-3">
            {recentShops.map((shop) => (
              <div key={shop.id} className="rounded-lg border border-stone-200 p-3">
                <div className="flex justify-between gap-3">
                  <strong>{shop.name}</strong>
                  <span className="text-sm font-bold text-stone-600">{shop.approvalStatus}</span>
                </div>
                <p className="mt-1 text-sm text-stone-600">{shop.owner.email} - {thaiDate(shop.createdAt)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2 className="mb-3 font-bold">ร้านที่ใช้งานเยอะ</h2>
          <div className="space-y-3">
            {topShops.map((shop, index) => (
              <div key={shop.id} className="rounded-lg bg-stone-50 p-3">
                <div className="flex justify-between gap-3">
                  <span>{index + 1}. {shop.name}</span>
                  <strong>{shop._count.orders} ออเดอร์</strong>
                </div>
                <p className="mt-1 text-sm text-stone-500">{shop._count.menus} เมนู</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
