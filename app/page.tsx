import Link from "next/link";
import { ArrowRight, BookOpen, Store } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-rice">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-5 py-12">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-leaf shadow-soft">
            <Store size={18} /> SimpleDelivery
          </div>
          <h1 className="text-4xl font-bold leading-tight text-ink md:text-6xl">ระบบรับออเดอร์อาหารสำหรับร้านไม่มีหน้าร้าน</h1>
          <p className="mt-5 text-lg leading-8 text-stone-700">
            เพิ่มเมนู แชร์ลิงก์ร้าน รับชำระเงินผ่าน PromptPay QR อัปโหลดสลิป และติดตามสถานะออเดอร์ได้ในที่เดียว
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/howtouse" className="tap inline-flex items-center justify-center gap-2 bg-leaf text-white">
              <BookOpen size={18} /> วิธีใช้งาน <ArrowRight size={18} />
            </Link>
            <Link href="/merchant/login" className="tap inline-flex items-center justify-center bg-white text-ink ring-1 ring-stone-200">
              เข้าสู่ระบบร้านค้า
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
