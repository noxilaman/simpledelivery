import Link from "next/link";
import { ArrowLeft, BadgeCheck, CalendarDays, CheckCircle2, ClipboardList, CreditCard, Gift, Megaphone, PackageCheck, QrCode, RefreshCw, Share2, ShoppingBasket, Store, UploadCloud, UserRound } from "lucide-react";

const shopSteps = [
  {
    icon: Store,
    title: "สมัครร้านและตั้งค่าร้าน",
    body: "กรอกชื่อร้าน เบอร์โทร PromptPay ชื่อบัญชี ที่อยู่ และ slug ร้าน จากนั้นรอ admin อนุมัติร้านก่อนเริ่มใช้งานจริง",
  },
  {
    icon: ShoppingBasket,
    title: "เพิ่มเมนูเข้าคลัง",
    body: "ไปที่เมนู คลังเมนู เพื่อเพิ่มชื่ออาหาร รายละเอียด ราคา รูปอาหาร และเปิดหรือซ่อนเมนูจากแผนขาย",
  },
  {
    icon: CalendarDays,
    title: "วางแผนขายรายวัน",
    body: "เลือกวันที่ขาย เลือกเมนูจากคลัง ใส่จำนวนที่จะขาย หรือใส่ 0 หากไม่จำกัดจำนวน พร้อมตั้งเวลาเปิดปิดของวันนั้น",
  },
  {
    icon: Share2,
    title: "แชร์ลิงก์ร้าน",
    body: "ส่งลิงก์ /shop/slug ของร้านให้ลูกค้าผ่าน LINE หรือ Facebook ลูกค้าเปิดดูเมนูและสั่งได้โดยไม่ต้องสมัครสมาชิก",
  },
  {
    icon: CreditCard,
    title: "ตรวจสลิปและรับออเดอร์",
    body: "เมื่อมีลูกค้าอัปโหลดสลิป ให้ร้านเปิดออเดอร์ ดูสลิป แล้วกดยืนยันหรือปฏิเสธการชำระเงิน",
  },
  {
    icon: PackageCheck,
    title: "จัดการครัวและสถานะ",
    body: "เปลี่ยนสถานะออเดอร์ รับออเดอร์ กำลังทำ พร้อมส่ง กำลังจัดส่ง และสำเร็จ พร้อมพิมพ์ใบครัว ใบส่ง และใบเสร็จสำหรับ printer roll",
  },
  {
    icon: Gift,
    title: "ทำ Campaign สมาชิก",
    body: "สร้างแคมเปญแต้มสำหรับ member เช่น สมัครใหม่ ยอดซื้อถึงยอด หรือได้แต้มตามช่วงเวลา เลือกให้แต้มเพิ่มหรือคูณแต้ม",
  },
  {
    icon: ClipboardList,
    title: "ดู Dashboard",
    body: "ดูยอดขายวันนี้ ออเดอร์รอตรวจสลิป ออเดอร์กำลังทำ สมาชิก แต้มสะสม และเมนูขายดีของร้าน",
  },
];

const customerSteps = [
  {
    icon: Store,
    title: "เปิดลิงก์ร้าน",
    body: "ลูกค้าเปิดลิงก์ร้านจาก LINE หรือ Facebook แล้วดูชื่อร้าน เบอร์โทร และเมนูที่เปิดขายวันนี้",
  },
  {
    icon: ShoppingBasket,
    title: "เลือกอาหารลงตะกร้า",
    body: "กดเพิ่มหรือลดจำนวน เลือกหลายเมนูได้ และดูจำนวนคงเหลือก่อนสั่ง",
  },
  {
    icon: ClipboardList,
    title: "กรอกข้อมูลจัดส่ง",
    body: "ใส่ชื่อ เบอร์โทร ที่อยู่จัดส่ง และหมายเหตุ เช่น ไม่เผ็ด ไม่ใส่ผัก หรือฝากไว้หน้าบ้าน",
  },
  {
    icon: QrCode,
    title: "สแกนจ่าย PromptPay",
    body: "หน้าชำระเงินจะแสดง QR Code ตามยอดสุทธิ ลูกค้าสามารถดาวน์โหลด QR ไปเปิดในแอปธนาคารเพื่อจ่ายได้",
  },
  {
    icon: UploadCloud,
    title: "อัปโหลดสลิป",
    body: "หลังโอนเงินแล้วให้อัปโหลดรูปสลิป ระบบจะเปลี่ยนสถานะเป็นส่งหลักฐานโอนเงินแล้ว",
  },
  {
    icon: RefreshCw,
    title: "ติดตามสถานะ",
    body: "เปิดหน้าติดตามออเดอร์ด้วย tracking link ดู timeline สถานะ และกด refresh เพื่อเช็คสถานะล่าสุด",
  },
  {
    icon: CheckCircle2,
    title: "กดได้รับอาหารแล้ว",
    body: "เมื่อได้รับอาหาร ให้กดยืนยันได้รับอาหารแล้ว ระบบจะแสดง popup ยืนยันก่อนเปลี่ยนสถานะเป็นส่งสำเร็จ",
  },
  {
    icon: UserRound,
    title: "สมัคร member เพื่อสะสมแต้ม",
    body: "ลูกค้าสามารถสมัคร member ของร้านเพื่อเก็บข้อมูลจัดส่ง ดูประวัติการซื้อ และรับแต้มจาก Campaign ของร้าน",
  },
];

function StepCard({ index, step }: { index: number; step: (typeof shopSteps)[number] }) {
  const Icon = step.icon;
  return (
    <article className="panel">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-leaf text-white">
          <Icon size={21} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-chili">ขั้นตอนที่ {index + 1}</p>
          <h3 className="mt-1 text-lg font-bold">{step.title}</h3>
          <p className="mt-2 text-sm leading-6 text-stone-600">{step.body}</p>
        </div>
      </div>
    </article>
  );
}

export default function HowToUsePage() {
  return (
    <main className="min-h-screen bg-rice">
      <section className="mx-auto max-w-6xl px-5 py-6 md:py-10">
        <Link href="/" className="tap inline-flex items-center gap-2 bg-white text-ink ring-1 ring-stone-200">
          <ArrowLeft size={18} /> กลับหน้าแรก
        </Link>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-leaf shadow-soft">
              <BadgeCheck size={18} /> คู่มือใช้งาน SimpleDelivery
            </div>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-ink md:text-5xl">เริ่มรับออเดอร์และติดตามงานได้ง่ายในไม่กี่ขั้นตอน</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-700">หน้านี้แบ่งเป็นคู่มือสำหรับร้านค้าและลูกค้า เหมาะสำหรับส่งให้ทีมร้านหรือแนบไว้ให้ลูกค้าอ่านก่อนสั่งอาหาร</p>
          </div>
          <div className="panel">
            <Megaphone className="text-leaf" size={24} />
            <h2 className="mt-3 font-bold">ลิงก์สำคัญ</h2>
            <div className="mt-3 grid gap-2">
              <Link href="/merchant/register" className="tap bg-leaf text-center text-white">สมัครร้านค้า</Link>
              <Link href="/merchant/login" className="tap bg-white text-center text-ink ring-1 ring-stone-200">เข้าสู่ระบบร้านค้า</Link>
              <Link href="/shop/krua-mae-manee" className="tap bg-white text-center text-ink ring-1 ring-stone-200">ดูร้านตัวอย่าง</Link>
            </div>
          </div>
        </div>

        <section id="shop" className="mt-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-leaf">สำหรับร้านค้า</p>
              <h2 className="text-2xl font-bold">วิธีใช้งานฝั่งร้าน</h2>
            </div>
            <Link href="/merchant/dashboard" className="tap bg-white text-ink ring-1 ring-stone-200">ไปหน้า Dashboard</Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {shopSteps.map((step, index) => (
              <StepCard key={step.title} index={index} step={step} />
            ))}
          </div>
        </section>

        <section id="customer" className="mt-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-leaf">สำหรับลูกค้า</p>
              <h2 className="text-2xl font-bold">วิธีสั่งอาหารและติดตามออเดอร์</h2>
            </div>
            <Link href="/shop/krua-mae-manee" className="tap bg-white text-ink ring-1 ring-stone-200">เปิดร้านตัวอย่าง</Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {customerSteps.map((step, index) => (
              <StepCard key={step.title} index={index} step={step} />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
