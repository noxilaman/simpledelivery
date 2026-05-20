"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Share2, UserCircle } from "lucide-react";
import { formatMoney } from "@/lib/format";

type Shop = {
  name: string;
  slug: string;
  phone: string;
  logoUrl?: string | null;
  address: string;
};

type Menu = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  stockQty: number;
};

type CartItem = Menu & { quantity: number; note?: string };

export function ShopMenuClient({ shop, menus, ordering }: { shop: Shop; menus: Menu[]; ordering: { canViewMenu: boolean; canOrder: boolean; message: string } }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    setCart(readCart());
  }, []);

  function updateCart(menu: Menu, delta: number) {
    const current = readCart();
    const existing = current.find((item) => item.id === menu.id);
    const next = existing
      ? current.map((item) => (item.id === menu.id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item)).filter((item) => item.quantity > 0)
      : [...current, { ...menu, quantity: 1 }];
    localStorage.setItem("simpleDeliveryCart", JSON.stringify({ shopSlug: shop.slug, items: next }));
    setCart(next);
  }

  async function shareShop() {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: shop.name, url });
    else await navigator.clipboard.writeText(url);
  }

  function readCart(): CartItem[] {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem("simpleDeliveryCart");
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return parsed.shopSlug === shop.slug ? parsed.items ?? [] : [];
    } catch {
      return [];
    }
  }

  return (
    <div className="min-h-screen bg-rice pb-28">
      <header className="bg-leaf text-white">
        <div className="mx-auto max-w-3xl px-5 py-6">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-white/15">
              {shop.logoUrl ? <Image src={shop.logoUrl} alt={shop.name} fill className="object-cover" /> : <div className="flex h-full items-center justify-center text-2xl font-bold">{shop.name.slice(0, 1)}</div>}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold">{shop.name}</h1>
              <p className="mt-1 text-sm text-white/85">{shop.phone}</p>
            </div>
            <button onClick={shareShop} className="tap bg-white/15 px-3" aria-label="แชร์ร้าน">
              <Share2 size={22} />
            </button>
          </div>
          <p className="mt-4 text-sm leading-6 text-white/85">{shop.address}</p>
          <Link href={`/shop/${shop.slug}/member`} className="tap mt-4 inline-flex items-center gap-2 bg-white/15 px-3 text-white">
            <UserCircle size={20} /> สมาชิก / แต้มสะสม
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-5">
        <div className={`mb-4 rounded-lg p-3 text-sm font-semibold ${ordering.canOrder ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
          {ordering.message}
        </div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">เมนูวันนี้</h2>
          <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-leaf">{menus.length} รายการ</span>
        </div>

        <div className="space-y-3">
          {!ordering.canViewMenu && <div className="panel text-stone-600">ยังไม่ถึงเวลาดูเมนูของวันนี้</div>}
          {menus.map((menu) => {
            const qty = cart.find((item) => item.id === menu.id)?.quantity ?? 0;
            return (
              <article key={menu.id} className="panel flex gap-3">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                  {menu.imageUrl ? <Image src={menu.imageUrl} alt={menu.name} fill className="object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-stone-400">ไม่มีรูป</div>}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold">{menu.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-stone-600">{menu.description}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-chili">{formatMoney(menu.price)}</p>
                      <p className="text-xs text-stone-500">{menu.stockQty === 0 ? "ขายไม่จำกัดจำนวน" : `เหลือ ${menu.stockQty} กล่อง`}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {qty > 0 && (
                        <button className="grid h-10 w-10 place-items-center rounded-lg bg-stone-100" onClick={() => updateCart(menu, -1)} aria-label="ลดจำนวน">
                          <Minus size={18} />
                        </button>
                      )}
                      {qty > 0 && <span className="w-6 text-center font-bold">{qty}</span>}
                      <button disabled={!ordering.canOrder} className="grid h-10 w-10 place-items-center rounded-lg bg-leaf text-white disabled:opacity-40" onClick={() => updateCart(menu, 1)} aria-label="เพิ่มลงตะกร้า">
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      {count > 0 && ordering.canOrder && (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-stone-200 bg-white p-4">
          <Link href="/checkout" className="tap mx-auto flex max-w-3xl items-center justify-center gap-2 bg-chili text-white">
            <ShoppingCart size={20} /> ดูตะกร้า ({count})
          </Link>
        </div>
      )}
    </div>
  );
}
