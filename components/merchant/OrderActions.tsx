"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { orderStatusLabels } from "@/lib/status";

type Status = keyof typeof orderStatusLabels;

export function StatusChanger({ orderId, current }: { orderId: string; current: Status }) {
  const router = useRouter();
  async function update(orderStatus: string) {
    const res = await fetch(`/api/merchant/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message);
    router.refresh();
  }

  return (
    <select className="field" value={current} onChange={(event) => update(event.target.value)}>
      {Object.entries(orderStatusLabels).map(([value, label]) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  );
}

export function PaymentReview({ paymentId, slipImageUrl }: { paymentId: string; slipImageUrl?: string | null }) {
  const router = useRouter();
  async function post(path: string) {
    const res = await fetch(`/api/merchant/payments/${paymentId}/${path}`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) return alert(data.message);
    router.refresh();
  }

  return (
    <section className="panel space-y-3">
      <h2 className="font-bold">ตรวจสอบการชำระเงิน</h2>
      {slipImageUrl ? (
        <div className="relative h-80 overflow-hidden rounded-lg bg-stone-100">
          <Image src={slipImageUrl} alt="สลิปโอนเงิน" fill className="object-contain" />
        </div>
      ) : (
        <p className="rounded-lg bg-stone-50 p-4 text-stone-600">ยังไม่มีสลิปจากลูกค้า</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => post("verify")} disabled={!slipImageUrl} className="tap flex items-center justify-center gap-2 bg-leaf text-white"><Check size={18} /> ยืนยัน</button>
        <button onClick={() => post("reject")} disabled={!slipImageUrl} className="tap flex items-center justify-center gap-2 bg-rose-600 text-white"><X size={18} /> ปฏิเสธ</button>
      </div>
    </section>
  );
}
