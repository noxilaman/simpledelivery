"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, Check, Clock, Save, Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/format";

type Menu = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  availableDate: string;
  stockQty: number;
  soldQty: number;
  isAvailable: boolean;
};

type Schedule = {
  openTime: string;
  closeTime: string;
  isClosed: boolean;
} | null;

export function MenuPlannerClient({
  selectedDate,
  plannedMenus,
  catalog,
  schedule,
}: {
  selectedDate: string;
  plannedMenus: Menu[];
  catalog: Menu[];
  schedule: Schedule;
}) {
  const router = useRouter();
  const openTime = schedule?.openTime ?? "09:00";
  const closeTime = schedule?.closeTime ?? "18:00";
  const isClosed = schedule?.isClosed ?? false;

  function changeDate(formData: FormData) {
    const date = String(formData.get("date") || selectedDate);
    router.push(`/merchant/planner?date=${date}`);
  }

  async function saveSchedule(formData: FormData) {
    const payload = {
      date: selectedDate,
      openTime: formData.get("openTime"),
      closeTime: formData.get("closeTime"),
      isClosed: formData.get("isClosed") === "on",
    };

    const res = await fetch("/api/merchant/planner", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message ?? "บันทึกเวลาเปิดปิดไม่สำเร็จ");
    router.refresh();
  }

  async function addToPlan(formData: FormData) {
    const payload = {
      availableDate: selectedDate,
      sourceMenuId: formData.get("sourceMenuId"),
      stockQty: Number(formData.get("stockQty") || 0),
    };

    const res = await fetch("/api/merchant/planner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message ?? "เพิ่มเมนูในแผนไม่สำเร็จ");
    router.refresh();
  }

  async function remove(menuId: string) {
    const confirmed = window.confirm("ลบเมนูนี้ออกจากแผนของวันนี้ใช่ไหม?");
    if (!confirmed) return;

    const res = await fetch(`/api/merchant/menus/${menuId}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return alert(data.message ?? "ลบไม่สำเร็จ");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <section className="panel">
        <form action={changeDate} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block flex-1">
            <span className="mb-2 block font-semibold">เลือกวันที่ต้องการวางแผนขาย</span>
            <input name="date" type="date" defaultValue={selectedDate} className="field" />
          </label>
          <button className="tap flex items-center justify-center gap-2 bg-leaf text-white">
            <CalendarDays size={20} /> ดูแผนวันนี้
          </button>
        </form>
      </section>

      <section className="panel">
        <form action={saveSchedule} className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="text-leaf" size={22} />
            <h2 className="text-lg font-bold">เวลาเปิด-ปิดร้านของวันที่ {selectedDate}</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <label>
              <span className="mb-2 block font-semibold">เวลาเปิดรับออเดอร์</span>
              <input name="openTime" type="time" defaultValue={openTime} className="field" />
            </label>
            <label>
              <span className="mb-2 block font-semibold">เวลาปิดรับออเดอร์</span>
              <input name="closeTime" type="time" defaultValue={closeTime} className="field" />
            </label>
            <label className="flex items-center gap-3 rounded-lg bg-stone-50 px-4 py-3 font-semibold sm:mt-8">
              <input name="isClosed" type="checkbox" defaultChecked={isClosed} className="h-5 w-5" />
              ปิดทั้งวัน
            </label>
          </div>
          <p className="text-sm text-stone-600">ลูกค้าจะดูเมนูได้ก่อนเวลาเปิด 1 ชั่วโมง แต่จะกดสั่งอาหารได้เฉพาะช่วงเวลาเปิด-ปิดเท่านั้น</p>
          <button className="tap flex w-full items-center justify-center gap-2 bg-leaf text-white sm:w-auto">
            <Save size={18} /> บันทึกเวลา
          </button>
        </form>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
        <section className="panel">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">เมนูที่จะขายวันที่ {selectedDate}</h2>
            <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-leaf ring-1 ring-stone-200">{plannedMenus.length} รายการ</span>
          </div>
          <div className="space-y-3">
            {plannedMenus.length === 0 && <p className="rounded-lg bg-stone-50 p-4 text-stone-600">ยังไม่มีเมนูในวันนี้ เลือกจากรายการด้านขวาเพื่อเพิ่มเข้าแผนได้เลย</p>}
            {plannedMenus.map((menu) => (
              <article key={menu.id} className="rounded-lg border border-stone-200 p-3">
                <div className="flex gap-3">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                    {menu.imageUrl ? <img src={menu.imageUrl} alt={menu.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-stone-400">ไม่มีรูป</div>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-3">
                      <h3 className="font-bold">{menu.name}</h3>
                      <strong className="text-chili">{formatMoney(menu.price)}</strong>
                    </div>
                    <p className="mt-1 text-sm text-stone-600">{menu.description}</p>
                    <p className="mt-2 text-sm font-semibold text-stone-700">{menu.stockQty === 0 ? "ขายไม่จำกัดจำนวน" : `จำกัด ${menu.stockQty} กล่อง`} - ขายแล้ว {menu.soldQty}</p>
                  </div>
                </div>
                <button onClick={() => remove(menu.id)} className="tap mt-3 flex w-full items-center justify-center gap-2 bg-rose-50 text-rose-700">
                  <Trash2 size={18} /> ลบออกจากแผนวันนี้
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="panel h-fit">
          <h2 className="text-lg font-bold">เลือกเมนูมาใส่ในวันนี้</h2>
          <p className="mt-1 text-sm text-stone-600">ใส่จำนวนที่ขายได้ของวันนั้น หรือใส่ 0 เพื่อขายไม่จำกัด</p>
          <div className="mt-4 space-y-3">
            {catalog.map((menu) => (
              <form key={menu.id} action={addToPlan} className="rounded-lg border border-stone-200 p-3">
                <input type="hidden" name="sourceMenuId" value={menu.id} />
                <div className="flex gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                    {menu.imageUrl ? <img src={menu.imageUrl} alt={menu.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-stone-400">ไม่มีรูป</div>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold">{menu.name}</h3>
                    <p className="text-sm text-chili">{formatMoney(menu.price)}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <input name="stockQty" type="number" min="0" defaultValue={0} className="field" aria-label="จำนวนที่ขายได้" />
                  <button className="tap flex shrink-0 items-center justify-center gap-2 bg-leaf text-white">
                    <Check size={18} /> ใส่แผน
                  </button>
                </div>
              </form>
            ))}
            {catalog.length === 0 && <p className="rounded-lg bg-stone-50 p-4 text-stone-600">ยังไม่มีเมนูต้นแบบ ไปเพิ่มเมนูที่หน้าเมนูก่อน</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
