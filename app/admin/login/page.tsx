import Link from "next/link";
import { LoginForm } from "@/components/merchant/AuthForm";

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-rice px-5 py-10">
      <h1 className="text-3xl font-bold">เข้าสู่ระบบ Admin</h1>
      <p className="mb-6 mt-2 text-stone-600">ดูภาพรวมระบบและจัดการร้านค้าที่สมัครเข้ามา</p>
      <LoginForm />
      <Link href="/merchant/login" className="mt-5 text-center font-semibold text-leaf">
        กลับไปหน้าเข้าสู่ระบบร้านค้า
      </Link>
    </main>
  );
}
