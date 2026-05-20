"use client";

import { useRouter } from "next/navigation";
import { Truck } from "lucide-react";

export function DeliverySettingsForm({ deliveryFee, deliveryNote }: { deliveryFee: number | string; deliveryNote?: string | null }) {
  const router = useRouter();

  async function save(formData: FormData) {
    const res = await fetch("/api/merchant/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deliveryFee: Number(formData.get("deliveryFee") || 0),
        deliveryNote: formData.get("deliveryNote"),
      }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message ?? "บันทึกค่าขนส่งไม่สำเร็จ");
    router.refresh();
  }

  return (
    <form action={save} className="panel space-y-3">
      <div className="flex items-center gap-2">
        <Truck className="text-leaf" size={22} />
        <h2 className="font-bold">ตั้งค่าขนส่ง</h2>
      </div>
      <label className="block">
        <span className="mb-2 block font-semibold">ค่าจัดส่ง</span>
        <input name="deliveryFee" type="number" min="0" defaultValue={Number(deliveryFee)} className="field" />
      </label>
      <label className="block">
        <span className="mb-2 block font-semibold">หมายเหตุ / พื้นที่จัดส่ง</span>
        <textarea name="deliveryNote" defaultValue={deliveryNote ?? ""} className="field min-h-24" placeholder="เช่น ส่งเฉพาะในเขต 5 กม. หรือค่าส่งเริ่มต้น 20 บาท" />
      </label>
      <button className="tap w-full bg-leaf text-white">บันทึกค่าขนส่ง</button>
    </form>
  );
}
