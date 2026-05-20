"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return alert(data.message);
    router.push(data.user?.role === "ADMIN" ? "/admin/dashboard" : "/merchant/dashboard");
  }

  return (
    <form action={submit} className="space-y-3">
      <input name="email" type="email" required className="field" placeholder="อีเมล" />
      <input name="password" type="password" required className="field" placeholder="รหัสผ่าน" />
      <button disabled={loading} className="tap w-full bg-leaf text-white">{loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</button>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return alert(data.message);
    router.push("/merchant/dashboard");
  }

  return (
    <form action={submit} className="space-y-3">
      <input name="shopName" required className="field" placeholder="ชื่อร้าน" />
      <input name="slug" required className="field" placeholder="slug ร้าน เช่น mae-noi-kitchen" />
      <input name="phone" required className="field" placeholder="เบอร์โทรร้าน" />
      <input name="promptpayId" required className="field" placeholder="PromptPay ID" />
      <input name="bankAccountName" required className="field" placeholder="ชื่อบัญชีรับเงิน" />
      <textarea name="address" required className="field min-h-24" placeholder="ที่อยู่ร้าน" />
      <input name="email" type="email" required className="field" placeholder="อีเมล" />
      <input name="password" type="password" required minLength={8} className="field" placeholder="รหัสผ่านอย่างน้อย 8 ตัว" />
      <button disabled={loading} className="tap w-full bg-leaf text-white">{loading ? "กำลังสมัคร..." : "สมัครร้านค้า"}</button>
    </form>
  );
}
