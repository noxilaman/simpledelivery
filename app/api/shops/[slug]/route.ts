import { decimalToNumber, fail, handleApiError, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const shop = await prisma.shop.findFirst({
      where: { slug, approvalStatus: "APPROVED" },
      select: {
        id: true,
        name: true,
        slug: true,
        phone: true,
        promptpayId: true,
        bankAccountName: true,
        address: true,
        deliveryFee: true,
        deliveryNote: true,
        logoUrl: true,
        isOpen: true,
        approvalStatus: true,
      },
    });
    if (!shop) return fail("ไม่พบร้านค้า", 404);
    return ok(decimalToNumber(shop));
  } catch (error) {
    return handleApiError(error);
  }
}
