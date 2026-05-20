"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Upload, UserPlus } from "lucide-react";

export function PaymentClient({ orderId }: { orderId: string }) {
  const router = useRouter();

  async function upload(formData: FormData) {
    const res = await fetch(`/api/orders/${orderId}/upload-slip`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message ?? "อัปโหลดไม่สำเร็จ");
    router.push(`/order/track/${data.trackingToken}`);
  }

  return (
    <form action={upload} className="panel mt-5 space-y-4">
      <label className="block">
        <span className="mb-2 block font-semibold">อัปโหลดสลิปโอนเงิน</span>
        <input name="slip" type="file" accept="image/png,image/jpeg,image/webp" required className="field" />
      </label>
      <button className="tap flex w-full items-center justify-center gap-2 bg-chili text-white">
        <Upload size={20} /> ส่งสลิปให้ร้านตรวจสอบ
      </button>
    </form>
  );
}

export function MemberSignupPrompt({ shopSlug, orderId }: { shopSlug: string; orderId: string }) {
  return (
    <section className="panel mt-4">
      <div className="flex gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-leaf/10 text-leaf">
          <UserPlus size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold">สมัครสมาชิกกับร้านนี้ไหม</h2>
          <p className="mt-1 text-sm leading-6 text-stone-600">
            เก็บข้อมูลจัดส่ง ประวัติออเดอร์ และยอดสะสมไว้กับร้านนี้ ครั้งหน้าล็อกอินด้วยเบอร์โทรและรหัสผ่านได้เลย
          </p>
          <Link href={`/shop/${shopSlug}/member/register?orderId=${orderId}`} className="tap mt-3 inline-flex items-center gap-2 bg-leaf text-white">
            <UserPlus size={18} /> สมัครสมาชิก
          </Link>
        </div>
      </div>
    </section>
  );
}

export function QrImage({ src, alt }: { src: string; alt: string }) {
  return <Image src={src} alt={alt} width={320} height={320} className="mx-auto rounded-lg border border-stone-200 bg-white p-3" unoptimized />;
}

export function DownloadQrButton({ src, orderCode }: { src: string; orderCode: string }) {
  function download() {
    const link = document.createElement("a");
    link.href = src;
    link.download = `promptpay-${orderCode}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <button type="button" onClick={download} className="tap mt-3 flex w-full items-center justify-center gap-2 bg-leaf text-white">
      <Download size={20} /> ดาวน์โหลด QR ไปจ่าย
    </button>
  );
}
