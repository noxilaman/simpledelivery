import { decimalToNumber, fail, handleApiError, ok } from "@/lib/api";
import { setCustomerMemberSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { memberLoginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const data = memberLoginSchema.parse(await request.json());
    const shop = await prisma.shop.findFirst({ where: { slug: data.shopSlug, approvalStatus: "APPROVED" } });
    if (!shop) return fail("ไม่พบร้านค้า", 404);

    const member = await prisma.customerMember.findUnique({
      where: { shopId_phone: { shopId: shop.id, phone: data.phone } },
    });
    if (!member || !(await verifyPassword(data.password, member.passwordHash))) {
      return fail("เบอร์โทรหรือรหัสผ่านไม่ถูกต้อง", 401);
    }

    await setCustomerMemberSession(member.id, shop.id);
    const points = await prisma.pointLedger.aggregate({
      where: { memberId: member.id },
      _sum: { points: true },
    });
    return ok(decimalToNumber({
      member: {
        id: member.id,
        name: member.name,
        phone: member.phone,
        deliveryAddress: member.deliveryAddress,
        deliveryNote: member.deliveryNote,
        totalOrders: member.totalOrders,
        totalSpent: member.totalSpent,
        points: points._sum.points ?? 0,
      },
    }));
  } catch (error) {
    return handleApiError(error);
  }
}
