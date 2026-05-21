import { Prisma } from "@prisma/client";
import { decimalToNumber, fail, handleApiError, ok } from "@/lib/api";
import { requireMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { campaignUpdateSchema } from "@/lib/validators";

function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const merchant = await requireMerchant();
    const { id } = await params;
    const existing = await prisma.campaign.findFirst({ where: { id, shopId: merchant.shop!.id } });
    if (!existing) return fail("ไม่พบแคมเปญ", 404);

    const data = campaignUpdateSchema.parse(await request.json());
    const conditionType = data.conditionType ?? existing.conditionType;
    const rewardType = data.rewardType ?? existing.rewardType;
    const startsAt = data.startsAt ?? existing.startsAt;
    const endsAt = data.endsAt ?? existing.endsAt;
    const minPurchaseAmount = data.minPurchaseAmount ?? existing.minPurchaseAmount?.toNumber() ?? null;
    const rewardPoints = data.rewardPoints ?? existing.rewardPoints ?? null;
    const pointMultiplier = data.pointMultiplier ?? existing.pointMultiplier?.toNumber() ?? null;

    if (toDate(endsAt) < toDate(startsAt)) throw new Error("วันที่สิ้นสุดต้องอยู่หลังวันที่เริ่ม");
    if (conditionType === "MIN_PURCHASE" && !minPurchaseAmount) throw new Error("กรุณาระบุยอดซื้อขั้นต่ำ");
    if (rewardType === "FIXED_POINTS" && !rewardPoints) throw new Error("กรุณาระบุจำนวนแต้มที่จะให้");
    if (rewardType === "POINT_MULTIPLIER" && !pointMultiplier) throw new Error("กรุณาระบุจำนวนคูณแต้ม");

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        conditionType,
        minPurchaseAmount: conditionType === "MIN_PURCHASE" ? new Prisma.Decimal(minPurchaseAmount ?? 0) : null,
        rewardType,
        rewardPoints: rewardType === "FIXED_POINTS" ? rewardPoints : null,
        pointMultiplier: rewardType === "POINT_MULTIPLIER" ? new Prisma.Decimal(pointMultiplier ?? 0) : null,
        startsAt,
        endsAt,
        isActive: data.isActive,
      },
    });

    return ok(decimalToNumber(updated));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const merchant = await requireMerchant();
    const { id } = await params;
    const existing = await prisma.campaign.findFirst({ where: { id, shopId: merchant.shop!.id }, select: { id: true } });
    if (!existing) return fail("ไม่พบแคมเปญ", 404);
    await prisma.campaign.delete({ where: { id } });
    return ok({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
