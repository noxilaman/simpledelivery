"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, PauseCircle, PlayCircle, Plus, Trash2, X } from "lucide-react";

type Shop = {
  id: string;
  name: string;
  slug: string;
  phone: string;
  promptpayId: string;
  bankAccountName: string;
  address: string;
  isOpen: boolean;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  owner: { email: string };
  _count: { menus: number; orders: number };
};

const approvalLabels: Record<Shop["approvalStatus"], string> = {
  PENDING: "รออนุมัติ",
  APPROVED: "อนุมัติแล้ว",
  REJECTED: "ไม่อนุมัติ",
};

const approvalTone: Record<Shop["approvalStatus"], string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-rose-100 text-rose-800",
};

export function AdminShopManager({ shops }: { shops: Shop[] }) {
  const router = useRouter();

  async function create(formData: FormData) {
    const payload = Object.fromEntries(formData);
    const res = await fetch("/api/admin/shops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, approveNow: formData.get("approveNow") === "on" }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message ?? "เพิ่มร้านไม่สำเร็จ");
    router.refresh();
  }

  async function post(path: string, success = "สำเร็จ") {
    const res = await fetch(path, { method: "POST" });
    const data = await res.json();
    if (!res.ok) return alert(data.message ?? success);
    router.refresh();
  }

  async function toggle(shop: Shop) {
    const res = await fetch(`/api/admin/shops/${shop.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOpen: !shop.isOpen }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message ?? "เปลี่ยนสถานะไม่สำเร็จ");
    router.refresh();
  }

  async function remove(shop: Shop) {
    const confirmed = window.confirm(`ลบร้าน "${shop.name}" และข้อมูลเจ้าของร้านทั้งหมดใช่ไหม?`);
    if (!confirmed) return;
    const res = await fetch(`/api/admin/shops/${shop.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return alert(data.message ?? "ลบร้านไม่สำเร็จ");
    router.refresh();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[390px_1fr]">
      <form action={create} className="panel h-fit space-y-3">
        <h2 className="text-lg font-bold">เพิ่มร้านโดย Admin</h2>
        <input name="shopName" required className="field" placeholder="ชื่อร้าน" />
        <input name="slug" required className="field" placeholder="slug เช่น mae-noi-kitchen" />
        <input name="phone" required className="field" placeholder="เบอร์โทรร้าน" />
        <input name="promptpayId" required className="field" placeholder="PromptPay ID" />
        <input name="bankAccountName" required className="field" placeholder="ชื่อบัญชีรับเงิน" />
        <textarea name="address" required className="field min-h-24" placeholder="ที่อยู่ร้าน" />
        <input name="email" type="email" required className="field" placeholder="อีเมลเจ้าของร้าน" />
        <input name="password" type="password" required minLength={8} className="field" placeholder="รหัสผ่านเริ่มต้น" />
        <label className="flex items-center gap-3 rounded-lg bg-stone-50 p-3 font-semibold">
          <input name="approveNow" type="checkbox" defaultChecked className="h-5 w-5" />
          อนุมัติและเปิดร้านทันที
        </label>
        <button className="tap flex w-full items-center justify-center gap-2 bg-leaf text-white">
          <Plus size={20} /> เพิ่มร้าน
        </button>
      </form>

      <div className="space-y-3">
        {shops.map((shop) => (
          <article key={shop.id} className="panel">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-lg font-bold">{shop.name}</h3>
                <p className="text-sm text-stone-600">{shop.owner.email}</p>
                <p className="text-sm text-stone-500">/{shop.slug} - {shop.phone}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-sm font-bold ${approvalTone[shop.approvalStatus]}`}>{approvalLabels[shop.approvalStatus]}</span>
                <span className={`rounded-full px-3 py-1 text-sm font-bold ${shop.isOpen ? "bg-blue-100 text-blue-800" : "bg-stone-100 text-stone-700"}`}>
                  {shop.isOpen ? "เปิดร้าน" : "ปิดร้าน"}
                </span>
              </div>
            </div>

            <div className="mt-3 grid gap-2 text-sm text-stone-600 sm:grid-cols-3">
              <span>{shop._count.menus} เมนู</span>
              <span>{shop._count.orders} ออเดอร์</span>
              <span>PromptPay {shop.promptpayId}</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => post(`/api/admin/shops/${shop.id}/approve`, "อนุมัติแล้ว")} className="tap flex items-center gap-2 bg-leaf px-3 text-white">
                <Check size={18} /> อนุมัติ
              </button>
              <button onClick={() => post(`/api/admin/shops/${shop.id}/reject`, "ไม่อนุมัติแล้ว")} className="tap flex items-center gap-2 bg-rose-50 px-3 text-rose-700">
                <X size={18} /> ไม่อนุมัติ
              </button>
              <button onClick={() => toggle(shop)} className="tap flex items-center gap-2 bg-white px-3 text-ink ring-1 ring-stone-200">
                {shop.isOpen ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
                {shop.isOpen ? "ปิดรับออเดอร์" : "เปิดรับออเดอร์"}
              </button>
              <Link href={`/shop/${shop.slug}`} className="tap bg-white px-3 text-leaf ring-1 ring-stone-200">
                ดูหน้าร้าน
              </Link>
              <button onClick={() => remove(shop)} className="tap ml-auto flex items-center gap-2 bg-rose-600 px-3 text-white">
                <Trash2 size={18} /> ลบ
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
