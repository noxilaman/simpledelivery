"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";

export function MemberLoginClient({ shopSlug }: { shopSlug: string }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const res = await fetch("/api/members/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shopSlug, phone, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return alert(data.message ?? "เข้าสู่ระบบสมาชิกไม่สำเร็จ");
    router.refresh();
  }

  return (
    <section className="panel mt-5 space-y-4">
      <div>
        <h2 className="font-bold">เข้าสู่ระบบสมาชิก</h2>
        <p className="mt-1 text-sm leading-6 text-stone-600">ใช้เบอร์โทรและรหัสผ่านที่สมัครไว้กับร้านนี้ เพื่อดูประวัติการซื้อและแต้มสะสม</p>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <input value={phone} onChange={(event) => setPhone(event.target.value)} required className="field" placeholder="เบอร์โทร" />
        <input value={password} onChange={(event) => setPassword(event.target.value)} required type="password" className="field" placeholder="รหัสผ่าน" />
        <button disabled={loading} className="tap flex w-full items-center justify-center gap-2 bg-leaf text-white">
          <LogIn size={20} /> {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
      </form>
      <Link href={`/shop/${shopSlug}`} className="tap flex items-center justify-center gap-2 bg-white text-ink ring-1 ring-stone-200">
        <UserPlus size={20} /> กลับไปสั่งอาหาร
      </Link>
    </section>
  );
}
