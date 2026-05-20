"use client";

import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";

export function ShopLogoUploader({ logoUrl, shopName }: { logoUrl?: string | null; shopName: string }) {
  const router = useRouter();

  async function upload(formData: FormData) {
    const file = formData.get("logo");
    if (!(file instanceof File) || file.size === 0) {
      alert("กรุณาเลือกรูปโลโก้ร้าน");
      return;
    }

    const res = await fetch("/api/merchant/settings", {
      method: "PATCH",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message ?? "อัปโหลดโลโก้ไม่สำเร็จ");
    router.refresh();
  }

  return (
    <form action={upload} className="panel space-y-3">
      <h2 className="font-bold">โลโก้ร้าน</h2>
      <div className="flex items-center gap-4">
        <div className="h-24 w-24 overflow-hidden rounded-lg bg-stone-100">
          {logoUrl ? (
            <img src={logoUrl} alt={shopName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-3xl font-bold text-stone-400">{shopName.slice(0, 1)}</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <input name="logo" type="file" accept="image/png,image/jpeg,image/webp" className="field" />
          <p className="mt-2 text-sm text-stone-500">รองรับ jpg, png, webp ขนาดไม่เกิน 5MB</p>
        </div>
      </div>
      <button className="tap flex w-full items-center justify-center gap-2 bg-leaf text-white">
        <Camera size={20} /> อัปโหลดโลโก้ร้าน
      </button>
    </form>
  );
}
