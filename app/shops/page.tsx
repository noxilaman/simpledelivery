import Link from "next/link";
import { ArrowLeft, ArrowRight, MapPin, Phone, Store, Utensils } from "lucide-react";
import { todayDateOnly } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PublicShopsPage() {
  const today = todayDateOnly();
  const shops = await prisma.shop.findMany({
    where: {
      approvalStatus: "APPROVED",
      isOpen: true,
    },
    include: {
      _count: {
        select: {
          menus: {
            where: {
              availableDate: today,
              isTemplate: false,
              isAvailable: true,
            },
          },
        },
      },
    },
    orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
  });

  return (
    <main className="min-h-screen bg-rice">
      <section className="mx-auto max-w-6xl px-5 py-6 md:py-10">
        <Link href="/" className="tap inline-flex items-center gap-2 bg-white text-ink ring-1 ring-stone-200">
          <ArrowLeft size={18} /> กลับหน้าแรก
        </Link>

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-leaf shadow-soft">
              <Store size={18} /> ร้านค้าที่เปิดให้บริการ
            </div>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-ink md:text-5xl">เลือกร้านอาหารในระบบ</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-700">แสดงเฉพาะร้านที่ได้รับอนุมัติและเปิดให้บริการอยู่ ลูกค้ากดเข้าร้านเพื่อดูเมนูวันนี้และสั่งอาหารได้ทันที</p>
          </div>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-leaf shadow-soft">{shops.length} ร้าน</span>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop) => (
            <Link key={shop.id} href={`/shop/${shop.slug}`} className="panel block transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex gap-3">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                  {shop.logoUrl ? (
                    <img src={shop.logoUrl} alt={shop.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl font-bold text-stone-400">{shop.name.slice(0, 1)}</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-bold">{shop.name}</h2>
                  <p className="mt-1 flex items-center gap-1 text-sm text-stone-600">
                    <Phone size={14} /> {shop.phone}
                  </p>
                  <p className="mt-2 line-clamp-2 flex gap-1 text-sm leading-6 text-stone-600">
                    <MapPin size={14} className="mt-1 shrink-0" /> {shop.address}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-stone-100 pt-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                  <Utensils size={14} /> เมนูวันนี้ {shop._count.menus}
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-leaf">
                  เข้าร้าน <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {shops.length === 0 && (
          <section className="panel mt-8 text-center">
            <Store className="mx-auto text-stone-400" size={36} />
            <h2 className="mt-3 text-xl font-bold">ยังไม่มีร้านที่เปิดให้บริการ</h2>
            <p className="mt-2 text-stone-600">เมื่อร้านได้รับอนุมัติและเปิดร้านแล้ว จะแสดงในหน้านี้โดยอัตโนมัติ</p>
          </section>
        )}
      </section>
    </main>
  );
}
