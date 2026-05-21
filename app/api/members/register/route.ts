import { PaymentStatus, Prisma } from "@prisma/client";
import { decimalToNumber, fail, handleApiError, ok } from "@/lib/api";
import { hashPassword, setCustomerMemberSession } from "@/lib/auth";
import { awardCampaignPoints } from "@/lib/campaigns";
import { prisma } from "@/lib/prisma";
import { memberRegisterSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const data = memberRegisterSchema.parse(await request.json());
    const shop = await prisma.shop.findFirst({ where: { slug: data.shopSlug, approvalStatus: "APPROVED" } });
    if (!shop) return fail("ไม่พบร้านค้า", 404);

    const now = new Date();
    const member = await prisma.$transaction(async (tx) => {
      const order = data.orderId
        ? await tx.order.findFirst({ where: { id: data.orderId, shopId: shop.id } })
        : null;
      if (data.orderId && !order) throw new Error("ไม่พบออเดอร์สำหรับสมัครสมาชิก");
      if (order && order.customerPhone !== data.phone) throw new Error("เบอร์โทรต้องตรงกับออเดอร์แรก");
      if (order?.memberId) throw new Error("ออเดอร์นี้ผูกกับสมาชิกแล้ว");

      const created = await tx.customerMember.create({
        data: {
          shopId: shop.id,
          name: data.name,
          phone: data.phone,
          passwordHash: await hashPassword(data.password),
          deliveryAddress: data.deliveryAddress,
          deliveryNote: data.deliveryNote,
          acceptedTermsAt: now,
          acceptedPdpaAt: now,
          totalOrders: order ? 1 : 0,
          totalSpent: order ? order.totalPrice : new Prisma.Decimal(0),
          lastOrderedAt: order?.createdAt,
        },
      });

      if (order) {
        await tx.order.update({
          where: { id: order.id },
          data: { memberId: created.id },
        });
        if (order.paymentStatus === PaymentStatus.verified) {
          await awardCampaignPoints(tx, order.id);
        }
      }

      return created;
    });

    await setCustomerMemberSession(member.id, shop.id);
    return ok(decimalToNumber({ member: { id: member.id, name: member.name, phone: member.phone } }), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
