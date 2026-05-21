"use client";

import { useRouter } from "next/navigation";
import { Camera, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/format";

type Menu = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  isAvailable: boolean;
};

export function MenuManager({ menus }: { menus: Menu[] }) {
  const router = useRouter();

  async function create(formData: FormData) {
    const res = await fetch("/api/merchant/menus", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) return alert(data.message);
    router.refresh();
  }

  async function toggle(menu: Menu) {
    const res = await fetch(`/api/merchant/menus/${menu.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !menu.isAvailable }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message);
    router.refresh();
  }

  async function updateImage(menuId: string, formData: FormData) {
    const file = formData.get("image");
    if (!(file instanceof File) || file.size === 0) {
      alert("กรุณาเลือกรูปเมนู");
      return;
    }

    const res = await fetch(`/api/merchant/menus/${menuId}`, { method: "PATCH", body: formData });
    const data = await res.json();
    if (!res.ok) return alert(data.message);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("ลบเมนูต้นแบบนี้ใช่ไหม เมนูที่เคยถูกวางแผนขายไว้แล้วจะไม่หาย")) return;
    const res = await fetch(`/api/merchant/menus/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return alert(data.message);
    router.refresh();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
      <form action={create} className="panel h-fit space-y-3">
        <h2 className="text-lg font-bold">เพิ่มเมนูเข้าคลัง</h2>
        <p className="text-sm text-stone-600">เมนูในหน้านี้ยังไม่เปิดขาย ลูกค้าจะเห็นเมนูเมื่อร้านนำไปวางแผนในหน้าแผนขายรายวัน</p>
        <input name="name" required className="field" placeholder="ชื่ออาหาร" />
        <textarea name="description" required className="field min-h-24" placeholder="รายละเอียดอาหาร" />
        <input name="price" type="number" required min="1" className="field" placeholder="ราคา" />
        <input name="image" type="file" accept="image/png,image/jpeg,image/webp" className="field" />
        <button className="tap flex w-full items-center justify-center gap-2 bg-leaf text-white">
          <Plus size={20} /> เพิ่มเมนู
        </button>
      </form>

      <div className="space-y-3">
        {menus.map((menu) => (
          <article key={menu.id} className="panel">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <div className="flex gap-3">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                  {menu.imageUrl ? (
                    <img src={menu.imageUrl} alt={menu.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-stone-400">ไม่มีรูป</div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold">{menu.name}</h3>
                  <p className="mt-1 text-sm text-stone-600">{menu.description}</p>
                  <p className="mt-2 font-bold text-chili">{formatMoney(menu.price)}</p>
                  <p className="mt-1 text-sm text-stone-500">{menu.isAvailable ? "พร้อมให้เลือกในหน้าแผนขาย" : "ซ่อนไว้จากหน้าแผนขาย"}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggle(menu)} className="grid h-11 w-11 place-items-center rounded-lg bg-stone-100" aria-label="เปิดปิดเมนู">
                  {menu.isAvailable ? <Eye size={19} /> : <EyeOff size={19} />}
                </button>
                <button onClick={() => remove(menu.id)} className="grid h-11 w-11 place-items-center rounded-lg bg-rose-50 text-rose-700" aria-label="ลบเมนู">
                  <Trash2 size={19} />
                </button>
              </div>
            </div>
            <form action={(formData) => updateImage(menu.id, formData)} className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input name="image" type="file" accept="image/png,image/jpeg,image/webp" className="field" />
              <button className="tap flex shrink-0 items-center justify-center gap-2 bg-white text-leaf ring-1 ring-stone-200">
                <Camera size={18} /> เปลี่ยนรูป
              </button>
            </form>
          </article>
        ))}
        {menus.length === 0 && <p className="panel text-stone-600">ยังไม่มีเมนูในคลัง เพิ่มเมนูแรกได้จากฟอร์มด้านซ้าย</p>}
      </div>
    </div>
  );
}
