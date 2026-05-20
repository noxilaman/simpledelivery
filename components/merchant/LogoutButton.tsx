"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton({ compact = true }: { compact?: boolean }) {
  const router = useRouter();

  async function logout() {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (!res.ok) {
      alert("ออกจากระบบไม่สำเร็จ");
      return;
    }
    router.push("/merchant/login");
    router.refresh();
  }

  if (!compact) {
    return (
      <button onClick={logout} className="tap flex items-center justify-center gap-2 bg-rose-50 px-3 text-rose-700">
        <LogOut size={18} /> ออกจากระบบ
      </button>
    );
  }

  return (
    <button onClick={logout} className="grid h-12 w-12 place-items-center rounded-lg text-rose-700 hover:bg-rose-50" title="ออกจากระบบ" aria-label="ออกจากระบบ">
      <LogOut size={22} />
    </button>
  );
}
