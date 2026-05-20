import Link from "next/link";
import { redirect } from "next/navigation";
import { ChefHat, Printer } from "lucide-react";
import { decimalToNumber } from "@/lib/api";
import { getCurrentMerchant } from "@/lib/auth";
import { formatMoney, thaiDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { orderStatusLabels, statusTone } from "@/lib/status";
import { MerchantShell } from "@/components/merchant/MerchantShell";

const kitchenStatuses = ["payment_verified", "accepted", "cooking", "ready_to_deliver"] as const;

export default async function MerchantKitchenPage() {
  const merchant = await getCurrentMerchant();
  if (!merchant?.shop) redirect("/merchant/login");

  const orders = await prisma.order.findMany({
    where: {
      shopId: merchant.shop.id,
      orderStatus: { in: [...kitchenStatuses] },
    },
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });

  const plain: any[] = decimalToNumber(orders);
  const itemSummary = new Map<string, number>();
  for (const order of plain) {
    for (const item of order.items) {
      itemSummary.set(item.menuName, (itemSummary.get(item.menuName) ?? 0) + item.quantity);
    }
  }

  return (
    <MerchantShell title="รายการในครัว">
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <section className="panel h-fit">
          <div className="mb-3 flex items-center gap-2">
            <ChefHat className="text-leaf" size={22} />
            <h2 className="font-bold">สรุปของที่ต้องทำ</h2>
          </div>
          <div className="space-y-2">
            {Array.from(itemSummary.entries()).map(([name, quantity]) => (
              <div key={name} className="flex justify-between rounded-lg bg-stone-50 p-3">
                <span>{name}</span>
                <strong>{quantity}</strong>
              </div>
            ))}
            {itemSummary.size === 0 && <p className="rounded-lg bg-stone-50 p-4 text-stone-600">ยังไม่มีรายการในครัว</p>}
          </div>
        </section>

        <section className="space-y-3">
          {plain.map((order) => (
            <article key={order.id} className="panel">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">{order.orderCode}</h2>
                  <p className="text-sm text-stone-600">{order.customerName} - {order.customerPhone}</p>
                  <p className="text-sm text-stone-500">{thaiDate(order.createdAt)}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-bold ${statusTone[order.orderStatus]}`}>{orderStatusLabels[order.orderStatus]}</span>
              </div>

              <div className="mt-4 divide-y divide-stone-100">
                {order.items.map((item: any) => (
                  <div key={item.id} className="py-3">
                    <div className="flex justify-between gap-3">
                      <span className="font-semibold">{item.menuName}</span>
                      <strong>x {item.quantity}</strong>
                    </div>
                    {item.note && <p className="mt-1 rounded-lg bg-amber-50 p-2 text-sm text-amber-800">หมายเหตุ: {item.note}</p>}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/merchant/orders/${order.id}`} className="tap bg-white text-ink ring-1 ring-stone-200">ดูออเดอร์</Link>
                <Link href={`/merchant/orders/${order.id}/print/kitchen`} className="tap inline-flex items-center gap-2 bg-leaf text-white">
                  <Printer size={18} /> ใบส่งในครัว
                </Link>
                <Link href={`/merchant/orders/${order.id}/print/receipt`} className="tap inline-flex items-center gap-2 bg-chili text-white">
                  <Printer size={18} /> ใบติดถุง
                </Link>
                <strong className="ml-auto self-center text-chili">{formatMoney(order.totalPrice)}</strong>
              </div>
            </article>
          ))}
        </section>
      </div>
    </MerchantShell>
  );
}
