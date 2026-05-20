"use client";

import { CheckCircle2, RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatMoney, thaiDate } from "@/lib/format";
import { orderFlow, orderStatusLabels, statusTone } from "@/lib/status";

type Order = {
  id: string;
  orderCode: string;
  orderStatus: keyof typeof orderStatusLabels;
  totalPrice: number;
  items: { id: string; menuName: string; quantity: number; price: number; note?: string | null }[];
  statusLogs: { id: string; newStatus: keyof typeof orderStatusLabels; createdAt: string; note?: string | null }[];
};

export function TrackClient({ order }: { order: Order }) {
  const router = useRouter();
  const currentIndex = orderFlow.indexOf(order.orderStatus as any);

  async function complete() {
    const confirmed = window.confirm("ยืนยันว่าได้รับอาหารแล้วใช่ไหม? หลังยืนยันแล้วสถานะจะเปลี่ยนเป็นส่งสำเร็จ");
    if (!confirmed) return;

    const res = await fetch(`/api/orders/${order.id}/customer-complete`, { method: "POST" });
    if (!res.ok) return alert("เปลี่ยนสถานะไม่สำเร็จ");
    router.refresh();
  }

  function refreshStatus() {
    router.refresh();
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl bg-rice px-5 py-6">
      <p className="font-semibold text-leaf">ติดตามออเดอร์</p>
      <div className="mt-1 flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold">{order.orderCode}</h1>
        <button onClick={refreshStatus} className="tap flex items-center justify-center gap-2 bg-white px-3 text-leaf ring-1 ring-stone-200">
          <RotateCw size={18} /> Refresh
        </button>
      </div>
      <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-bold ${statusTone[order.orderStatus]}`}>
        {orderStatusLabels[order.orderStatus]}
      </span>

      <section className="panel mt-5">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between gap-3 py-2">
            <span>{item.menuName} x {item.quantity}</span>
            <strong>{formatMoney(item.price * item.quantity)}</strong>
          </div>
        ))}
        <div className="mt-3 flex justify-between border-t border-stone-200 pt-3 text-lg">
          <span>ยอดรวม</span>
          <strong className="text-chili">{formatMoney(order.totalPrice)}</strong>
        </div>
      </section>

      <section className="panel mt-5">
        <h2 className="mb-4 font-bold">สถานะออเดอร์</h2>
        <div className="space-y-4">
          {orderFlow.map((status, index) => {
            const done = order.orderStatus === "completed" || index <= currentIndex;
            const log = order.statusLogs.find((entry) => entry.newStatus === status);
            return (
              <div key={status} className="flex gap-3">
                <div className={`mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full ${done ? "bg-leaf text-white" : "bg-stone-200 text-stone-400"}`}>
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <p className="font-semibold">{orderStatusLabels[status]}</p>
                  {log && <p className="text-sm text-stone-500">{thaiDate(log.createdAt)}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {order.orderStatus !== "completed" && order.orderStatus !== "cancelled" && (
        <button onClick={complete} className="tap mt-5 w-full bg-leaf text-white">
          ได้รับอาหารแล้ว
        </button>
      )}
    </main>
  );
}
