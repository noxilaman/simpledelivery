import { decimalToNumber, handleApiError, ok } from "@/lib/api";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminShopSchema } from "@/lib/validators";

export async function GET() {
  try {
    await requireAdmin();
    const shops = await prisma.shop.findMany({
      include: {
        owner: { select: { id: true, email: true, role: true, createdAt: true } },
        _count: { select: { menus: true, orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return ok(decimalToNumber(shops));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const data = adminShopSchema.parse(await request.json());
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: await hashPassword(data.password),
        role: "MERCHANT",
        shop: {
          create: {
            name: data.shopName,
            slug: data.slug,
            phone: data.phone,
            promptpayId: data.promptpayId,
            bankAccountName: data.bankAccountName,
            address: data.address,
            isOpen: data.approveNow,
            approvalStatus: data.approveNow ? "APPROVED" : "PENDING",
            approvedAt: data.approveNow ? new Date() : null,
          },
        },
      },
      include: { shop: true },
    });

    return ok(decimalToNumber({ user: { id: user.id, email: user.email, role: user.role }, shop: user.shop }), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
