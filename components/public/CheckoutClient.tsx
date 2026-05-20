"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/format";

type CartItem = { id: string; name: string; price: number; quantity: number; note?: string };

export function CheckoutClient() {
  const router = useRouter();
  const [shopSlug, setShopSlug] = useState("");
  const [items, setItems] = useState<CartItem[]>([]);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [loading, setLoading] = useState(false);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  useEffect(() => {
    const raw = localStorage.getItem("simpleDeliveryCart");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    setShopSlug(parsed.shopSlug);
    setItems(parsed.items ?? []);

    fetch(`/api/shops/${parsed.shopSlug}`)
      .then((res) => res.json())
      .then((shop) => {
        setDeliveryFee(Number(shop.deliveryFee ?? 0));
        setDeliveryNote(shop.deliveryNote ?? "");
      })
      .catch(() => {
        setDeliveryFee(0);
      });
  }, []);

  function persist(next: CartItem[]) {
    setItems(next);
    localStorage.setItem("simpleDeliveryCart", JSON.stringify({ shopSlug, items: next }));
  }

  async function submit(formData: FormData) {
    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shopSlug,
        customerName: formData.get("customerName"),
        customerPhone: formData.get("customerPhone"),
        deliveryAddress: formData.get("deliveryAddress"),
        deliveryNote: formData.get("deliveryNote"),
        items: items.map((item) => ({ menuId: item.id, quantity: item.quantity, note: item.note })),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return alert(data.message ?? "สร้างออเดอร์ไม่สำเร็จ");
    localStorage.removeItem("simpleDeliveryCart");
    router.push(`/payment/${data.id}`);
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl bg-rice px-5 py-6">
      <h1 className="text-2xl font-bold">ตะกร้าและข้อมูลจัดส่ง</h1>
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="panel">
            <div className="flex justify-between gap-3">
              <div>
                <h2 className="font-bold">{item.name}</h2>
                <p className="mt-1 text-sm text-stone-600">{formatMoney(item.price)} x {item.quantity}</p>
              </div>
              <button className="grid h-10 w-10 place-items-center rounded-lg bg-rose-50 text-rose-700" onClick={() => persist(items.filter((entry) => entry.id !== item.id))} aria-label="ลบเมนู">
                <Trash2 size={18} />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button className="grid h-11 w-11 place-items-center rounded-lg bg-stone-100" onClick={() => persist(items.map((entry) => entry.id === item.id ? { ...entry, quantity: Math.max(1, entry.quantity - 1) } : entry))}>
                <Minus size={18} />
              </button>
              <span className="w-8 text-center font-bold">{item.quantity}</span>
              <button className="grid h-11 w-11 place-items-center rounded-lg bg-stone-100" onClick={() => persist(items.map((entry) => entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry))}>
                <Plus size={18} />
              </button>
            </div>
            <input className="field mt-3" placeholder="หมายเหตุเมนู เช่น ไม่เผ็ด ไม่ใส่ผัก" value={item.note ?? ""} onChange={(event) => persist(items.map((entry) => entry.id === item.id ? { ...entry, note: event.target.value } : entry))} />
          </div>
        ))}
      </div>

      <form action={submit} className="mt-5 space-y-3">
        <input name="customerName" required className="field" placeholder="ชื่อลูกค้า" />
        <input name="customerPhone" required className="field" placeholder="เบอร์โทร" />
        <textarea name="deliveryAddress" required className="field min-h-28" placeholder="ที่อยู่จัดส่ง" />
        <textarea name="deliveryNote" className="field min-h-24" placeholder="หมายเหตุการส่ง" />

        <section className="panel space-y-2">
          <div className="flex justify-between"><span>ค่าอาหาร</span><strong>{formatMoney(subtotal)}</strong></div>
          <div className="flex justify-between"><span>ค่าจัดส่ง</span><strong>{formatMoney(deliveryFee)}</strong></div>
          {deliveryNote && <p className="rounded-lg bg-stone-50 p-3 text-sm text-stone-600">{deliveryNote}</p>}
          <div className="flex justify-between border-t border-stone-200 pt-3 text-lg"><span>ยอดสุทธิ</span><strong className="text-chili">{formatMoney(subtotal + deliveryFee)}</strong></div>
        </section>

        <button disabled={loading || items.length === 0} className="tap w-full bg-leaf text-white">
          {loading ? "กำลังสร้างออเดอร์..." : "ยืนยันออเดอร์และชำระเงิน"}
        </button>
      </form>
    </main>
  );
}
