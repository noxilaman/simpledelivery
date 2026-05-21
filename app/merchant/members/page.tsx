import { redirect } from "next/navigation";
import { Gift, ShoppingBag, Users, Wallet } from "lucide-react";
import { getCurrentMerchant } from "@/lib/auth";
import { formatMoney, thaiDate } from "@/lib/format";
import { sumPointLedgers } from "@/lib/members";
import { prisma } from "@/lib/prisma";
import { MerchantShell } from "@/components/merchant/MerchantShell";

export default async function MerchantMembersPage() {
  const merchant = await getCurrentMerchant();
  if (!merchant?.shop) redirect("/merchant/login");

  const members = await prisma.customerMember.findMany({
    where: { shopId: merchant.shop.id },
    include: { pointLedgers: true },
    orderBy: [{ totalSpent: "desc" }, { updatedAt: "desc" }],
    take: 100,
  });

  const memberCount = members.length;
  const totalSpent = members.reduce((sum, member) => sum + member.totalSpent.toNumber(), 0);
  const totalOrders = members.reduce((sum, member) => sum + member.totalOrders, 0);
  const totalPoints = members.reduce((sum, member) => sum + sumPointLedgers(member.pointLedgers), 0);
  const cards = [
    { label: "สมาชิกทั้งหมด", value: memberCount, icon: Users },
    { label: "แต้มสะสมรวม", value: totalPoints, icon: Gift },
    { label: "ยอดซื้อสะสม", value: formatMoney(totalSpent), icon: Wallet },
    { label: "ออเดอร์จากสมาชิก", value: totalOrders, icon: ShoppingBag },
  ];

  return (
    <MerchantShell title="สมาชิกและแต้มสะสม">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <section key={card.label} className="panel">
              <Icon className="text-leaf" size={22} />
              <p className="mt-3 text-sm text-stone-600">{card.label}</p>
              <p className="mt-1 text-2xl font-bold">{card.value}</p>
            </section>
          );
        })}
      </div>

      <section className="panel mt-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold">รายชื่อสมาชิก</h2>
          <p className="text-sm text-stone-500">แต้มมาจาก Campaign ที่ร้านเปิดใช้งาน</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-stone-200 text-stone-500">
              <tr>
                <th className="py-3 pr-3 font-semibold">สมาชิก</th>
                <th className="py-3 pr-3 font-semibold">เบอร์โทร</th>
                <th className="py-3 pr-3 text-right font-semibold">ออเดอร์</th>
                <th className="py-3 pr-3 text-right font-semibold">ยอดสะสม</th>
                <th className="py-3 pr-3 text-right font-semibold">แต้ม</th>
                <th className="py-3 text-right font-semibold">สั่งล่าสุด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {members.map((member) => {
                const spent = member.totalSpent.toNumber();
                return (
                  <tr key={member.id}>
                    <td className="py-3 pr-3 font-semibold">{member.name}</td>
                    <td className="py-3 pr-3 text-stone-600">{member.phone}</td>
                    <td className="py-3 pr-3 text-right">{member.totalOrders}</td>
                    <td className="py-3 pr-3 text-right font-semibold text-chili">{formatMoney(spent)}</td>
                    <td className="py-3 pr-3 text-right font-bold text-leaf">{sumPointLedgers(member.pointLedgers)}</td>
                    <td className="py-3 text-right text-stone-600">{member.lastOrderedAt ? thaiDate(member.lastOrderedAt) : "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {members.length === 0 && <p className="mt-3 rounded-lg bg-stone-50 p-4 text-stone-600">ยังไม่มีสมาชิกของร้านนี้</p>}
      </section>
    </MerchantShell>
  );
}
