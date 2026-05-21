import { Prisma } from "@prisma/client";
import { decimalToNumber, handleApiError, ok } from "@/lib/api";
import { requireMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { campaignSchema } from "@/lib/validators";

function validateCampaignInput(data: {
  conditionType: string;
  minPurchaseAmount?: number | null;
  rewardType: string;
  rewardPoints?: number | null;
  pointMultiplier?: number | null;
  startsAt: Date;
  endsAt: Date;
}) {
  if (data.endsAt < data.startsAt) throw new Error("วันที่สิ้นสุดต้องอยู่หลังวันที่เริ่ม");
  if (data.conditionType === "MIN_PURCHASE" && !data.minPurchaseAmount) throw new Error("กรุณาระบุยอดซื้อขั้นต่ำ");
  if (data.rewardType === "FIXED_POINTS" && !data.rewardPoints) throw new Error("กรุณาระบุจำนวนแต้มที่จะให้");
  if (data.rewardType === "POINT_MULTIPLIER" && !data.pointMultiplier) throw new Error("กรุณาระบุจำนวนคูณแต้ม");
}

export async function GET() {
  try {
    const merchant = await requireMerchant();
    const campaigns = await prisma.campaign.findMany({
      where: { shopId: merchant.shop!.id },
      include: { _count: { select: { pointLedgers: true } } },
      orderBy: [{ isActive: "desc" }, { startsAt: "desc" }],
    });
    return ok(decimalToNumber(campaigns));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const merchant = await requireMerchant();
    const data = campaignSchema.parse(await request.json());
    validateCampaignInput(data);

    const campaign = await prisma.campaign.create({
      data: {
        shopId: merchant.shop!.id,
        name: data.name,
        description: data.description,
        conditionType: data.conditionType,
        minPurchaseAmount: data.conditionType === "MIN_PURCHASE" ? new Prisma.Decimal(data.minPurchaseAmount ?? 0) : null,
        rewardType: data.rewardType,
        rewardPoints: data.rewardType === "FIXED_POINTS" ? data.rewardPoints ?? 0 : null,
        pointMultiplier: data.rewardType === "POINT_MULTIPLIER" ? new Prisma.Decimal(data.pointMultiplier ?? 0) : null,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        isActive: data.isActive,
      },
    });

    return ok(decimalToNumber(campaign), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
