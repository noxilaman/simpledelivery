import Link from "next/link";
import { BarChart3, Store } from "lucide-react";
import { LogoutButton } from "@/components/merchant/LogoutButton";

const nav = [
  { href: "/admin/dashboard", label: "ภาพรวม", icon: BarChart3 },
  { href: "/admin/shops", label: "ร้านค้า", icon: Store },
];

export function AdminShell({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="min-h-screen bg-rice pb-20 md:pb-0">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-leaf">Admin</p>
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
          <LogoutButton compact={false} />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-5 md:pl-24">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-2 border-t border-stone-200 bg-white md:hidden">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 px-2 py-3 text-xs font-semibold text-stone-700">
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <aside className="fixed left-0 top-0 hidden h-screen w-20 flex-col items-center gap-4 border-r border-stone-200 bg-white py-6 md:flex">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="grid h-12 w-12 place-items-center rounded-lg text-stone-700 hover:bg-stone-100" title={item.label}>
              <Icon size={22} />
            </Link>
          );
        })}
      </aside>
    </div>
  );
}
