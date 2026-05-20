"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Download, Upload } from "lucide-react";

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
