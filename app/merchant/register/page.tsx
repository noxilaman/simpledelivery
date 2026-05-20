import Link from "next/link";
import { RegisterForm } from "@/components/merchant/AuthForm";

export default function MerchantRegisterPage() {
  return (
    <main className="mx-auto max-w-md bg-rice px-5 py-8">
      <h1 className="text-3xl font-bold">สมัครร้านค้า</h1>
      <p className="mb-6 mt-2 text-stone-600">เปิดหน้าร้านออนไลน์ในไม่กี่นาที</p>
      <RegisterForm />
      <Link href="/merchant/login" className="mt-5 block text-center font-semibold text-leaf">มีบัญชีแล้ว เข้าสู่ระบบ</Link>
    </main>
  );
}
