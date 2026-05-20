import Link from "next/link";
import { LoginForm } from "@/components/merchant/AuthForm";

export default function MerchantLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-rice px-5 py-10">
      <h1 className="text-3xl font-bold">เข้าสู่ระบบร้านค้า</h1>
      <p className="mb-6 mt-2 text-stone-600">จัดการเมนูและออเดอร์ของร้าน</p>
      <LoginForm />
      <Link href="/merchant/register" className="mt-5 text-center font-semibold text-leaf">ยังไม่มีบัญชี สมัครร้านค้า</Link>
    </main>
  );
}
