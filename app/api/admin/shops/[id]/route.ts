import { decimalToNumber, fail, handleApiError, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateShopSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(8).optional(),
  promptpayId: z.string().min(10).optional(),
  bankAccountName: z.string().min(2).optional(),
  address: z.string().min(5).optional(),
  isOpen: z.coerce.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const data = updateShopSchema.parse(await request.json());
    const shop = await prisma.shop.update({ where: { id }, data, include: { owner: { select: { email: true } } } });
    return ok(decimalToNumber(shop));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const shop = await prisma.shop.findUnique({ where: { id } });
    if (!shop) return fail("ไม่พบร้านค้า", 404);
    await prisma.user.delete({ where: { id: shop.ownerId } });
    return ok({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
