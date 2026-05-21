"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Gift, Percent, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { formatMoney } from "@/lib/format";

type Campaign = {
  id: string;
  name: string;
  description?: string | null;
  conditionType: "NEW_CUSTOMER" | "MIN_PURCHASE" | "IN_PERIOD";
  minPurchaseAmount?: number | null;
  rewardType: "FIXED_POINTS" | "POINT_MULTIPLIER";
  rewardPoints?: number | null;
  pointMultiplier?: number | null;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  _count?: { pointLedgers: number };
};

type Ledger = {
  id: string;
  customerName: string;
  customerPhone: string;
  points: number;
  note?: string | null;
  createdAt: string;
};

const conditionLabels = {
  NEW_CUSTOMER: "สมัครใหม่",
  MIN_PURCHASE: "ยอดซื้อถึงยอด",
  IN_PERIOD: "ได้ทันทีตามช่วงเวลา",
};

const rewardLabels = {
  FIXED_POINTS: "ให้แต้มเพิ่ม",
  POINT_MULTIPLIER: "คูณแต้ม",
};

function toInputDate(value: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export function CampaignManager({ initialCampaigns, recentLedgers }: { initialCampaigns: Campaign[]; recentLedgers: Ledger[] }) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [loading, setLoading] = useState(false);
  const today = useMemo(() => new Date(), []);
  const defaultEnd = useMemo(() => {
    const value = new Date(today);
    value.setDate(value.getDate() + 7);
    value.setHours(23, 59, 0, 0);
    return value;
  }, [today]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    conditionType: "IN_PERIOD",
    minPurchaseAmount: "300",
    rewardType: "FIXED_POINTS",
    rewardPoints: "20",
    pointMultiplier: "2",
    startsAt: toInputDate(today),
    endsAt: toInputDate(defaultEnd),
    isActive: true,
  });

  async function refresh() {
    const res = await fetch("/api/merchant/campaigns");
    const data = await res.json();
    if (res.ok) setCampaigns(data);
  }

  async function createCampaign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const res = await fetch("/api/merchant/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        minPurchaseAmount: Number(form.minPurchaseAmount),
        rewardPoints: Number(form.rewardPoints),
        pointMultiplier: Number(form.pointMultiplier),
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      alert(data.message ?? "สร้างแคมเปญไม่สำเร็จ");
      return;
    }
    setForm((current) => ({ ...current, name: "", description: "" }));
    await refresh();
  }

  async function toggleCampaign(campaign: Campaign) {
    const res = await fetch(`/api/merchant/campaigns/${campaign.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !campaign.isActive }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.message ?? "อัปเดตแคมเปญไม่สำเร็จ");
      return;
    }
    await refresh();
  }

  async function deleteCampaign(campaign: Campaign) {
    if (!confirm(`ลบแคมเปญ "${campaign.name}" ใช่ไหม`)) return;
    const res = await fetch(`/api/merchant/campaigns/${campaign.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.message ?? "ลบแคมเปญไม่สำเร็จ");
      return;
    }
    await refresh();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
      <section className="panel">
        <div className="mb-4 flex items-center gap-2">
          <Gift className="text-leaf" size={22} />
          <div>
            <h2 className="font-bold">สร้างแคมเปญแต้มสมาชิก</h2>
            <p className="text-sm text-stone-500">แจกแต้มเฉพาะออเดอร์ที่ผูกกับ member เท่านั้น</p>
          </div>
        </div>

        <form className="space-y-3" onSubmit={createCampaign}>
          <input className="field" placeholder="ชื่อแคมเปญ" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <textarea className="field min-h-24" placeholder="รายละเอียดสั้น ๆ" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">ช่วงวันที่ใช้แคมเปญ</span>
            <div className="grid gap-2 sm:grid-cols-2">
              <input className="field" type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} required />
              <input className="field" type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} required />
            </div>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">เงื่อนไขการได้แต้ม</span>
            <select className="field" value={form.conditionType} onChange={(e) => setForm({ ...form, conditionType: e.target.value })}>
              <option value="NEW_CUSTOMER">สมัครใหม่</option>
              <option value="MIN_PURCHASE">ยอดซื้อถึงยอด</option>
              <option value="IN_PERIOD">ได้ทันทีตามช่วงเวลา</option>
            </select>
          </label>

          {form.conditionType === "MIN_PURCHASE" && (
            <input className="field" type="number" min="1" placeholder="ยอดซื้อขั้นต่ำ เช่น 300" value={form.minPurchaseAmount} onChange={(e) => setForm({ ...form, minPurchaseAmount: e.target.value })} />
          )}

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">สิ่งที่จะให้</span>
            <select className="field" value={form.rewardType} onChange={(e) => setForm({ ...form, rewardType: e.target.value })}>
              <option value="FIXED_POINTS">ให้แต้มเพิ่มไปเลย</option>
              <option value="POINT_MULTIPLIER">ได้แต้มคูณจำนวนที่ตั้ง</option>
            </select>
          </label>

          {form.rewardType === "FIXED_POINTS" ? (
            <input className="field" type="number" min="1" placeholder="จำนวนแต้ม เช่น 20" value={form.rewardPoints} onChange={(e) => setForm({ ...form, rewardPoints: e.target.value })} />
          ) : (
            <input className="field" type="number" min="0.1" step="0.1" placeholder="ตัวคูณ เช่น 2" value={form.pointMultiplier} onChange={(e) => setForm({ ...form, pointMultiplier: e.target.value })} />
          )}

          <label className="flex items-center gap-2 rounded-lg bg-stone-50 p-3 text-sm font-semibold">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            เปิดใช้งานทันที
          </label>

          <button className="tap flex w-full items-center justify-center gap-2 bg-leaf text-white" disabled={loading}>
            <Plus size={20} /> {loading ? "กำลังบันทึก..." : "สร้างแคมเปญ"}
          </button>
        </form>
      </section>

      <div className="space-y-5">
        <section className="panel">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-bold">แคมเปญทั้งหมด</h2>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-semibold">{campaigns.length} รายการ</span>
          </div>
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <article key={campaign.id} className="rounded-lg border border-stone-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{campaign.name}</h3>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${campaign.isActive ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                        {campaign.isActive ? "เปิดใช้งาน" : "ปิดอยู่"}
                      </span>
                    </div>
                    {campaign.description && <p className="mt-1 text-sm text-stone-600">{campaign.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button className="tap bg-stone-100 px-3" type="button" onClick={() => toggleCampaign(campaign)} title={campaign.isActive ? "ปิดแคมเปญ" : "เปิดแคมเปญ"}>
                      {campaign.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                    <button className="tap bg-red-50 px-3 text-red-700" type="button" onClick={() => deleteCampaign(campaign)} title="ลบแคมเปญ">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                  <div className="rounded-lg bg-stone-50 p-3">
                    <CalendarClock size={18} className="mb-1 text-stone-500" />
                    {new Date(campaign.startsAt).toLocaleDateString("th-TH")} - {new Date(campaign.endsAt).toLocaleDateString("th-TH")}
                  </div>
                  <div className="rounded-lg bg-stone-50 p-3">
                    <Percent size={18} className="mb-1 text-stone-500" />
                    {conditionLabels[campaign.conditionType]}
                    {campaign.conditionType === "MIN_PURCHASE" && campaign.minPurchaseAmount ? ` ${formatMoney(campaign.minPurchaseAmount)}` : ""}
                  </div>
                  <div className="rounded-lg bg-stone-50 p-3">
                    <Gift size={18} className="mb-1 text-stone-500" />
                    {rewardLabels[campaign.rewardType]}{" "}
                    {campaign.rewardType === "FIXED_POINTS" ? `${campaign.rewardPoints ?? 0} แต้ม` : `x${campaign.pointMultiplier ?? 0}`}
                  </div>
                </div>
                <p className="mt-3 text-sm text-stone-500">แจกแต้มแล้ว {campaign._count?.pointLedgers ?? 0} ครั้ง</p>
              </article>
            ))}
            {campaigns.length === 0 && <p className="rounded-lg bg-stone-50 p-4 text-stone-600">ยังไม่มีแคมเปญแต้มสมาชิก</p>}
          </div>
        </section>

        <section className="panel">
          <h2 className="mb-3 font-bold">ประวัติแต้มล่าสุด</h2>
          <div className="space-y-2">
            {recentLedgers.map((ledger) => (
              <div key={ledger.id} className="flex items-center justify-between gap-3 rounded-lg bg-stone-50 p-3 text-sm">
                <div>
                  <p className="font-semibold">{ledger.customerName}</p>
                  <p className="text-stone-500">{ledger.note ?? "-"} • {ledger.customerPhone}</p>
                </div>
                <p className="text-lg font-bold text-leaf">+{ledger.points}</p>
              </div>
            ))}
            {recentLedgers.length === 0 && <p className="rounded-lg bg-stone-50 p-4 text-stone-600">ยังไม่มีประวัติการแจกแต้ม</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
