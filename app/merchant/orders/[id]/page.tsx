import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Printer } from "lucide-react";
import { decimalToNumber } from "@/lib/api";
import { getCurrentMerchant } from "@/lib/auth";
import { formatMoney, thaiDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { orderStatusLabels, paymentStatusLabels, statusTone } from "@/lib/status";
import { MerchantShell } from "@/components/merchant/MerchantShell";
import { PaymentReview, StatusChanger } from "@/components/merchant/OrderActions";

export default async function MerchantOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const merchant = await getCurrentMerchant();
  if (!merchant?.shop) redirect("/merchant/login");
  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, shopId: merchant.shop.id },
    include: { items: true, payment: true, statusLogs: { orderBy: { createdAt: "asc" } } },
  });
  if (!order) notFound();
  const plain: any = decimalToNumber(order);

  return (
    <MerchantShell title={plain.orderCode}>
      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <section className="panel">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">{plain.customerName}</h2>
                <p className="text-stone-600">{plain.customerPhone}</p>
              </div>
              <strong className="text-2xl text-chili">{formatMoney(plain.totalPrice)}</strong>
            </div>
            <p className="mt-4 rounded-lg bg-stone-50 p-3">{plain.deliveryAddress}</p>
            {plain.deliveryNote && <p className="mt-2 text-sm text-stone-600">หมายเหตุ: {plain.deliveryNote}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-1 text-sm font-bold ${statusTone[plain.orderStatus]}`}>{orderStatusLabels[plain.orderStatus]}</span>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-bold text-stone-700">{paymentStatusLabels[plain.paymentStatus]}</span>
            </div>
          </section>

          <section className="panel">
            <h2 className="mb-3 font-bold">รายการอาหาร</h2>
            {plain.items.map((item: any) => (
              <div key={item.id} className="border-b border-stone-100 py-3 last:border-0">
                <div className="flex justify-between">
                  <span>{item.menuName} x {item.quantity}</span>
                  <strong>{formatMoney(item.price * item.quantity)}</strong>
                </div>
                {item.note && <p className="mt-1 text-sm text-stone-600">หมายเหตุ: {item.note}</p>}
              </div>
            ))}
          </section>

          <section className="panel">
            <h2 className="mb-3 font-bold">ประวัติสถานะ</h2>
            <div className="space-y-3">
              {plain.statusLogs.map((log: any) => (
                <div key={log.id} className="rounded-lg bg-stone-50 p-3">
                  <strong>{orderStatusLabels[log.newStatus]}</strong>
                  <p className="text-sm text-stone-500">{thaiDate(log.createdAt)}</p>
                  {log.note && <p className="text-sm text-stone-600">{log.note}</p>}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="panel">
            <h2 className="mb-3 font-bold">เปลี่ยนสถานะออเดอร์</h2>
            <StatusChanger orderId={plain.id} current={plain.orderStatus} />
          </section>
          <section className="panel space-y-3">
            <h2 className="font-bold">พิมพ์เอกสาร</h2>
            <Link href={`/merchant/orders/${plain.id}/print/kitchen`} className="tap flex items-center justify-center gap-2 bg-white text-ink ring-1 ring-stone-200">
              <Printer size={18} /> พิมพ์ใบส่งในครัว
            </Link>
            <Link href={`/merchant/orders/${plain.id}/print/delivery`} className="tap flex items-center justify-center gap-2 bg-leaf text-white">
              <Printer size={18} /> พิมพ์ใบส่งของ
            </Link>
            <Link href={`/merchant/orders/${plain.id}/print/receipt`} className="tap flex items-center justify-center gap-2 bg-chili text-white">
              <Printer size={18} /> พิมพ์ใบเสร็จ / ใบติดถุง
            </Link>
          </section>
          {plain.payment && <PaymentReview paymentId={plain.payment.id} slipImageUrl={plain.payment.slipImageUrl} />}
        </div>
      </div>
    </MerchantShell>
  );
}
