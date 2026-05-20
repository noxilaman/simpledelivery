import { formatMoney, thaiDate } from "@/lib/format";
import { PrintButton } from "@/components/print/PrintButton";

type PrintableOrderProps = {
  type: "delivery" | "receipt";
  order: any;
  shop: any;
  paper?: "58" | "80";
};

export function PrintableOrder({ type, order, shop, paper = "80" }: PrintableOrderProps) {
  const isDelivery = type === "delivery";
  const paperWidth = paper === "58" ? "58mm" : "80mm";

  return (
    <main className="mx-auto min-h-screen bg-stone-100 p-4 text-ink print:bg-white print:p-0">
      <style>{`
        @media print {
          @page { size: ${paperWidth} auto; margin: 0; }
          html, body { width: ${paperWidth}; background: white !important; }
          body { margin: 0 !important; }
          .receipt-paper { box-shadow: none !important; width: ${paperWidth} !important; padding: 3mm !important; }
        }
      `}</style>

      <div className="mx-auto mb-4 flex max-w-md flex-wrap justify-between gap-2 print:hidden">
        <PrintButton label={isDelivery ? "พิมพ์ใบส่งของ" : "พิมพ์ใบติดถุง"} />
        <a href={`/merchant/orders/${order.id}/print/${type}?paper=80`} className="tap bg-white text-ink ring-1 ring-stone-200">80mm</a>
        <a href={`/merchant/orders/${order.id}/print/${type}?paper=58`} className="tap bg-white text-ink ring-1 ring-stone-200">58mm</a>
        <a href={`/merchant/orders/${order.id}`} className="tap bg-white text-ink ring-1 ring-stone-200">กลับ</a>
      </div>

      <article className="receipt-paper mx-auto bg-white p-3 text-[12px] leading-5 shadow-soft" style={{ width: paperWidth }}>
        <header className="text-center">
          <p className="text-base font-bold">{shop.name}</p>
          <p>{shop.phone}</p>
          <p className="whitespace-pre-wrap text-[11px]">{shop.address}</p>
          <div className="my-2 border-t border-dashed border-ink" />
          <h1 className="text-lg font-bold">{isDelivery ? "ใบส่งของ" : "ใบเสร็จ / ใบติดถุง"}</h1>
          <p className="font-bold">{order.orderCode}</p>
          <p>{thaiDate(order.createdAt)}</p>
        </header>

        <div className="my-2 border-t border-dashed border-ink" />

        <section>
          <p><strong>ลูกค้า:</strong> {order.customerName}</p>
          <p><strong>โทร:</strong> {order.customerPhone}</p>
          {isDelivery && <p className="whitespace-pre-wrap"><strong>ที่อยู่:</strong> {order.deliveryAddress}</p>}
          {isDelivery && order.deliveryNote && <p><strong>หมายเหตุส่ง:</strong> {order.deliveryNote}</p>}
        </section>

        <div className="my-2 border-t border-dashed border-ink" />

        <section>
          {order.items.map((item: any) => (
            <div key={item.id} className="py-1">
              <div className="flex justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold">{item.menuName}</p>
                  {item.note && <p className="text-[11px]">หมายเหตุ: {item.note}</p>}
                </div>
                <div className="shrink-0 text-right">
                  <p>x{item.quantity}</p>
                  <p>{formatMoney(Number(item.price) * item.quantity)}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <div className="my-2 border-t border-dashed border-ink" />

        <section className="space-y-1">
          <div className="flex justify-between">
            <span>ค่าอาหาร</span>
            <span>{formatMoney(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>ค่าจัดส่ง</span>
            <span>{formatMoney(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between border-t border-ink pt-1 text-base font-bold">
            <span>รวมสุทธิ</span>
            <span>{formatMoney(order.totalPrice)}</span>
          </div>
        </section>

        {isDelivery ? (
          <section className="mt-8 space-y-8 text-center">
            <div className="border-t border-ink pt-1">ผู้ส่งสินค้า</div>
            <div className="border-t border-ink pt-1">ผู้รับสินค้า</div>
          </section>
        ) : (
          <section className="mt-3 border border-ink p-2 text-center">
            <p className="font-bold">ติดกับถุงอาหาร</p>
            <p>{order.orderCode}</p>
          </section>
        )}

        <footer className="mt-3 text-center text-[11px]">
          <div className="my-2 border-t border-dashed border-ink" />
          <p>ขอบคุณที่อุดหนุน</p>
        </footer>
      </article>
    </main>
  );
}
