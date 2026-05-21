import { redirect } from "next/navigation";
import { Gift, Trophy, Users } from "lucide-react";
import { decimalToNumber } from "@/lib/api";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CampaignManager } from "@/components/merchant/campaigns/CampaignManager";
import { MerchantShell } from "@/components/merchant/MerchantShell";

export default async function MerchantCampaignsPage() {
  const merchant = await getCurrentMerchant();
  if (!merchant?.shop) redirect("/merchant/login");

  const [campaigns, recentLedgers, pointSummary, memberCount] = await Promise.all([
    prisma.campaign.findMany({
      where: { shopId: merchant.shop.id },
      include: { _count: { select: { pointLedgers: true } } },
      orderBy: [{ isActive: "desc" }, { startsAt: "desc" }],
    }),
    prisma.pointLedger.findMany({
      where: { shopId: merchant.shop.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.pointLedger.aggregate({
      where: { shopId: merchant.shop.id },
      _sum: { points: true },
    }),
    prisma.customerMember.count({ where: { shopId: merchant.shop.id } }),
  ]);

  const activeCampaigns = campaigns.filter((campaign) => campaign.isActive).length;
  const totalPoints = pointSummary._sum.points ?? 0;

  return (
    <MerchantShell title="แคมเปญแต้มสมาชิก">
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <section className="panel">
          <Gift className="text-leaf" size={22} />
          <p className="mt-3 text-sm text-stone-600">แคมเปญที่เปิดอยู่</p>
          <p className="mt-1 text-2xl font-bold">{activeCampaigns}</p>
        </section>
        <section className="panel">
          <Trophy className="text-leaf" size={22} />
          <p className="mt-3 text-sm text-stone-600">แต้มที่แจกแล้ว</p>
          <p className="mt-1 text-2xl font-bold">{totalPoints}</p>
        </section>
        <section className="panel">
          <Users className="text-leaf" size={22} />
          <p className="mt-3 text-sm text-stone-600">สมาชิกทั้งหมด</p>
          <p className="mt-1 text-2xl font-bold">{memberCount}</p>
        </section>
      </div>

      <CampaignManager initialCampaigns={decimalToNumber(campaigns)} recentLedgers={decimalToNumber(recentLedgers)} />
    </MerchantShell>
  );
}
