import { decimalToNumber, fail, handleApiError, ok } from "@/lib/api";
import { getCurrentCustomerMember } from "@/lib/auth";
import { calculateMemberPoints } from "@/lib/members";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopSlug = searchParams.get("shopSlug");
    if (!shopSlug) return fail("กรุณาระบุร้านค้า", 422);

    const shop = await prisma.shop.findFirst({ where: { slug: shopSlug, approvalStatus: "APPROVED" } });
    if (!shop) return fail("ไม่พบร้านค้า", 404);

    const member = await getCurrentCustomerMember(shop.id);
    if (!member) return ok({ member: null });

    return ok(decimalToNumber({
      member: {
        id: member.id,
        name: member.name,
        phone: member.phone,
        deliveryAddress: member.deliveryAddress,
        deliveryNote: member.deliveryNote,
        totalOrders: member.totalOrders,
        totalSpent: member.totalSpent,
        points: calculateMemberPoints(member.totalSpent.toNumber()),
      },
    }));
  } catch (error) {
    return handleApiError(error);
  }
}
