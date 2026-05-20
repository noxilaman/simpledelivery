import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { generatePromptPayQr } from "@/lib/promptpay";
import { prisma } from "@/lib/prisma";
import { DownloadQrButton, PaymentClient, QrImage } from "@/components/public/PaymentClient";

export default async function PaymentPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { shop: true, items: true },
  });
  if (!order) notFound();

  const qr = await generatePromptPayQr(order.shop.promptpayId, order.totalPrice.toNumber());

  return (
    <main className="mx-auto min-h-screen max-w-3xl bg-rice px-5 py-6">
      <div className="flex items-center gap-2 text-leaf">
        <CheckCircle2 size={22} />
        <span className="font-semibold">สร้างออเดอร์แล้ว</span>
      </div>
      <h1 className="mt-2 text-2xl font-bold">ชำระเงิน {formatMoney(order.totalPrice.toNumber())}</h1>
      <p className="mt-2 text-stone-600">เลขออเดอร์ {order.orderCode}</p>

      <section className="panel mt-5 space-y-3 text-center">
        <QrImage src={qr.dataUrl} alt="PromptPay QR" />
        <DownloadQrButton src={qr.dataUrl} orderCode={order.orderCode} />
        <div>
          <p className="font-bold">{order.shop.bankAccountName}</p>
          <p className="text-stone-600">PromptPay: {order.shop.promptpayId}</p>
        </div>
      </section>

      <section className="panel mt-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between py-2">
            <span>{item.menuName} x {item.quantity}</span>
            <strong>{formatMoney(item.price.toNumber() * item.quantity)}</strong>
          </div>
        ))}
      </section>

      <PaymentClient orderId={order.id} />
    </main>
  );
}
