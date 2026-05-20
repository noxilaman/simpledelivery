"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Eye, ShieldCheck } from "lucide-react";

type MemberRegisterClientProps = {
  shopSlug: string;
  orderId?: string;
  defaults: {
    name: string;
    phone: string;
    deliveryAddress: string;
    deliveryNote: string;
  };
};

export function MemberRegisterClient({ shopSlug, orderId, defaults }: MemberRegisterClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    const res = await fetch("/api/members/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shopSlug,
        orderId,
        name: formData.get("name"),
        phone: formData.get("phone"),
        password: formData.get("password"),
        deliveryAddress: formData.get("deliveryAddress"),
        deliveryNote: formData.get("deliveryNote"),
        acceptedTerms: formData.get("acceptedTerms") === "on",
        acceptedPdpa: formData.get("acceptedPdpa") === "on",
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return alert(data.message ?? "สมัครสมาชิกไม่สำเร็จ");
    router.push(orderId ? `/payment/${orderId}` : `/shop/${shopSlug}`);
  }

  return (
    <form action={submit} className="mt-5 space-y-4">
      <section className="panel space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-leaf" size={22} />
          <h2 className="font-bold">ข้อมูลสมาชิก</h2>
        </div>
        <input name="name" required defaultValue={defaults.name} className="field" placeholder="ชื่อสมาชิก" />
        <input name="phone" required defaultValue={defaults.phone} className="field" placeholder="เบอร์โทรสำหรับเข้าสู่ระบบ" />
        <input name="password" required minLength={8} type="password" className="field" placeholder="ตั้งรหัสผ่านอย่างน้อย 8 ตัว" />
        <textarea name="deliveryAddress" required defaultValue={defaults.deliveryAddress} className="field min-h-28" placeholder="ที่อยู่จัดส่งหลัก" />
        <textarea name="deliveryNote" defaultValue={defaults.deliveryNote} className="field min-h-24" placeholder="หมายเหตุการส่งประจำ" />
      </section>

      <section className="panel space-y-3">
        <details className="rounded-lg border border-stone-200 bg-stone-50 p-3">
          <summary className="flex cursor-pointer items-center gap-2 font-bold">
            <Eye size={18} /> Terms and Conditions
          </summary>
          <div className="mt-3 space-y-2 text-sm leading-6 text-stone-600">
            <p>สมาชิกนี้ผูกกับร้านที่สมัครเท่านั้น ใช้เพื่อเติมข้อมูลสั่งซื้อ ดูประวัติ และคำนวณยอดสะสมของร้านนั้น</p>
            <p>ลูกค้ายังต้องตรวจสอบข้อมูลจัดส่งและรายการอาหารทุกครั้งก่อนยืนยันออเดอร์</p>
          </div>
        </details>
        <label className="flex gap-3 rounded-lg border border-stone-200 p-3">
          <input name="acceptedTerms" required type="checkbox" className="mt-1 h-5 w-5 accent-leaf" />
          <span className="text-sm leading-6">ฉันอ่านและยอมรับ Terms and Conditions แล้ว</span>
        </label>

        <details className="rounded-lg border border-stone-200 bg-stone-50 p-3">
          <summary className="flex cursor-pointer items-center gap-2 font-bold">
            <Eye size={18} /> รายละเอียด PDPA
          </summary>
          <div className="mt-3 space-y-2 text-sm leading-6 text-stone-600">
            <p>ระบบจะเก็บชื่อ เบอร์โทร ที่อยู่ หมายเหตุจัดส่ง ประวัติออเดอร์ และยอดสะสม เพื่อให้ร้านให้บริการและเติมข้อมูลการสั่งซื้อครั้งถัดไป</p>
            <p>ข้อมูลสมาชิกถูกเก็บแยกตามร้าน ลูกค้าควรใช้รหัสผ่านที่ไม่ซ้ำกับบริการสำคัญอื่น</p>
          </div>
        </details>
        <label className="flex gap-3 rounded-lg border border-stone-200 p-3">
          <input name="acceptedPdpa" required type="checkbox" className="mt-1 h-5 w-5 accent-leaf" />
          <span className="text-sm leading-6">ฉันอ่านและยอมรับการเก็บ/ใช้ข้อมูลตาม PDPA แล้ว</span>
        </label>
      </section>

      <button disabled={loading} className="tap flex w-full items-center justify-center gap-2 bg-leaf text-white">
        <Check size={20} /> {loading ? "กำลังสร้างสมาชิก..." : "สร้าง member"}
      </button>
    </form>
  );
}
