import Link from "next/link";
import { notFound } from "next/navigation";
import { Gift, History, ShoppingBag } from "lucide-react";
import { decimalToNumber } from "@/lib/api";
import { getCurrentCustomerMember } from "@/lib/auth";
import { formatMoney, thaiDate } from "@/lib/format";
import { sumPointLedgers } from "@/lib/members";
import { prisma } from "@/lib/prisma";
import { orderStatusLabels, statusTone } from "@/lib/status";
import { MemberLoginClient } from "@/components/public/MemberLoginClient";

export default async function ShopMemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shop = await prisma.shop.findFirst({ where: { slug, approvalStatus: "APPROVED" } });
  if (!shop) notFound();

  const currentMember = await getCurrentCustomerMember(shop.id);
  const member = currentMember
    ? await prisma.customerMember.findUnique({
        where: { id: currentMember.id },
        include: {
          pointLedgers: { orderBy: { createdAt: "desc" }, take: 20 },
          orders: {
            orderBy: { createdAt: "desc" },
            include: { items: true },
            take: 30,
          },
        },
      })
    : null;

  const plain: any = member ? decimalToNumber(member) : null;
  const points = plain ? sumPointLedgers(plain.pointLedgers) : 0;

  return (
    <main className="mx-auto min-h-screen max-w-3xl bg-rice px-5 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-leaf">{shop.name}</p>
          <h1 className="text-2xl font-bold">สมาชิกและแต้มสะสม</h1>
          <p className="mt-2 text-sm text-stone-600">แต้มมาจาก Campaign สมาชิกของร้าน</p>
        </div>
        <Link href={`/shop/${shop.slug}`} className="tap bg-white text-ink ring-1 ring-stone-200">กลับไปร้าน</Link>
      </div>

      {!plain ? (
        <MemberLoginClient shopSlug={shop.slug} />
      ) : (
        <div className="mt-5 space-y-4">
          <section className="grid gap-3 sm:grid-cols-3">
            <div className="panel">
              <div className="flex items-center gap-2 text-leaf">
                <Gift size={20} />
                <span className="text-sm font-semibold">แต้มสะสม</span>
              </div>
              <p className="mt-2 text-3xl font-bold">{points}</p>
              <p className="mt-1 text-xs text-stone-500">จากแคมเปญที่เข้าเงื่อนไข</p>
            </div>
            <div className="panel">
              <div className="flex items-center gap-2 text-chili">
                <ShoppingBag size={20} />
                <span className="text-sm font-semibold">จำนวนออเดอร์</span>
              </div>
              <p className="mt-2 text-3xl font-bold">{plain.totalOrders}</p>
              <p className="mt-1 text-xs text-stone-500">เฉพาะร้านนี้</p>
            </div>
            <div className="panel">
              <div className="flex items-center gap-2 text-stone-700">
                <History size={20} />
                <span className="text-sm font-semibold">สั่งล่าสุด</span>
              </div>
              <p className="mt-2 text-sm font-bold">{plain.lastOrderedAt ? thaiDate(plain.lastOrderedAt) : "-"}</p>
            </div>
          </section>

          <section className="panel">
            <h2 className="font-bold">{plain.name}</h2>
            <p className="mt-1 text-sm text-stone-600">{plain.phone}</p>
            <p className="mt-3 whitespace-pre-wrap rounded-lg bg-stone-50 p-3 text-sm text-stone-700">{plain.deliveryAddress}</p>
            {plain.deliveryNote && <p className="mt-2 text-sm text-stone-600">หมายเหตุส่งประจำ: {plain.deliveryNote}</p>}
          </section>

          <section className="panel">
            <h2 className="mb-3 font-bold">ประวัติแต้มล่าสุด</h2>
            <div className="space-y-2">
              {plain.pointLedgers.map((ledger: any) => (
                <div key={ledger.id} className="flex items-center justify-between gap-3 rounded-lg bg-stone-50 p-3 text-sm">
                  <span>{ledger.note ?? "แต้มสมาชิก"}</span>
                  <strong className="text-leaf">+{ledger.points}</strong>
                </div>
              ))}
              {plain.pointLedgers.length === 0 && <p className="text-sm text-stone-600">ยังไม่มีแต้มจาก Campaign</p>}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">ประวัติการซื้อ</h2>
              <span className="text-sm text-stone-500">ล่าสุด 30 รายการ</span>
            </div>
            {plain.orders.map((order: any) => (
              <article key={order.id} className="panel">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold">{order.orderCode}</h3>
                    <p className="text-sm text-stone-500">{thaiDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-3 py-1 text-sm font-bold ${statusTone[order.orderStatus]}`}>{orderStatusLabels[order.orderStatus]}</span>
                    <p className="mt-2 font-bold text-chili">{formatMoney(order.totalPrice)}</p>
                  </div>
                </div>
                <div className="mt-3 divide-y divide-stone-100">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between gap-3 py-2 text-sm">
                      <span>{item.menuName} x {item.quantity}</span>
                      <strong>{formatMoney(item.price * item.quantity)}</strong>
                    </div>
                  ))}
                </div>
              </article>
            ))}
            {plain.orders.length === 0 && <p className="panel text-stone-600">ยังไม่มีประวัติการซื้อ</p>}
          </section>
        </div>
      )}
    </main>
  );
}
