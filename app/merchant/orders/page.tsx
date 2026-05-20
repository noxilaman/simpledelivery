import Link from "next/link";
import { redirect } from "next/navigation";
import { decimalToNumber } from "@/lib/api";
import { getCurrentMerchant } from "@/lib/auth";
import { formatMoney, thaiDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { orderStatusLabels, paymentStatusLabels, statusTone } from "@/lib/status";
import { MerchantShell } from "@/components/merchant/MerchantShell";

export default async function MerchantOrdersPage() {
  const merchant = await getCurrentMerchant();
  if (!merchant?.shop) redirect("/merchant/login");

  const orders = await prisma.order.findMany({
    where: { shopId: merchant.shop.id },
    include: { items: true, payment: true },
    orderBy: { createdAt: "desc" },
    take: 80,
  });
  const plain: any[] = decimalToNumber(orders);

  return (
    <MerchantShell title="รายการออเดอร์">
      <div className="space-y-3">
        {plain.map((order) => (
          <Link key={order.id} href={`/merchant/orders/${order.id}`} className="panel block">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-bold">{order.orderCode}</h2>
                <p className="mt-1 text-sm text-stone-600">{order.customerName} - {order.customerPhone}</p>
                <p className="text-sm text-stone-500">{thaiDate(order.createdAt)}</p>
              </div>
              <strong className="text-chili">{formatMoney(order.totalPrice)}</strong>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-1 text-sm font-bold ${statusTone[order.orderStatus]}`}>{orderStatusLabels[order.orderStatus]}</span>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-bold text-stone-700">{paymentStatusLabels[order.paymentStatus]}</span>
            </div>
          </Link>
        ))}
      </div>
    </MerchantShell>
  );
}
