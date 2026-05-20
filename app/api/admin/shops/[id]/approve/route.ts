import { decimalToNumber, handleApiError, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const shop = await prisma.shop.update({
      where: { id },
      data: { approvalStatus: "APPROVED", approvedAt: new Date(), isOpen: true },
      include: { owner: { select: { email: true } } },
    });
    return ok(decimalToNumber(shop));
  } catch (error) {
    return handleApiError(error);
  }
}
