import { CampaignConditionType, CampaignRewardType, PaymentStatus, Prisma } from "@prisma/client";

export const BASE_POINT_SPEND = 25;

type CampaignTx = Prisma.TransactionClient;

function decimalToNumber(value: Prisma.Decimal | number | null | undefined) {
  if (value == null) return 0;
  return typeof value === "number" ? value : value.toNumber();
}

export function calculateBasePoints(totalPrice: Prisma.Decimal | number) {
  return Math.floor(decimalToNumber(totalPrice) / BASE_POINT_SPEND);
}

export async function awardCampaignPoints(tx: CampaignTx, orderId: string) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { member: true },
  });

  if (!order?.memberId) return [];

  const campaigns = await tx.campaign.findMany({
    where: {
      shopId: order.shopId,
      isActive: true,
      startsAt: { lte: order.createdAt },
      endsAt: { gte: order.createdAt },
    },
    orderBy: { createdAt: "asc" },
  });

  const awarded = [];
  const totalPrice = decimalToNumber(order.totalPrice);
  const basePoints = calculateBasePoints(order.totalPrice);

  for (const campaign of campaigns) {
    let eligible = campaign.conditionType === CampaignConditionType.IN_PERIOD;

    if (campaign.conditionType === CampaignConditionType.NEW_CUSTOMER) {
      const priorOrder = await tx.order.findFirst({
        where: {
          shopId: order.shopId,
          memberId: order.memberId,
          paymentStatus: PaymentStatus.verified,
          NOT: { id: order.id },
        },
        select: { id: true },
      });
      eligible = !priorOrder;
    }

    if (campaign.conditionType === CampaignConditionType.MIN_PURCHASE) {
      eligible = totalPrice >= decimalToNumber(campaign.minPurchaseAmount);
    }

    if (!eligible) continue;

    const points =
      campaign.rewardType === CampaignRewardType.FIXED_POINTS
        ? campaign.rewardPoints ?? 0
        : Math.floor(basePoints * decimalToNumber(campaign.pointMultiplier));

    if (points <= 0) continue;

    try {
      const ledger = await tx.pointLedger.create({
        data: {
          shopId: order.shopId,
          campaignId: campaign.id,
          orderId: order.id,
          memberId: order.memberId,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          points,
          note: campaign.name,
        },
      });
      awarded.push(ledger);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") continue;
      throw error;
    }
  }

  return awarded;
}
