import { randomUUID } from "crypto";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { decimalToNumber, fail, handleApiError, ok } from "@/lib/api";
import { getCurrentCustomerMember } from "@/lib/auth";
import { createOrderCode, logOrderStatus } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { todayDateOnly } from "@/lib/format";
import { orderSchema } from "@/lib/validators";
import { getScheduleState } from "@/lib/schedule";

export async function POST(request: Request) {
  try {
    const data = orderSchema.parse(await request.json());
    const order = await prisma.$transaction(async (tx) => {
      const shop = await tx.shop.findFirst({ where: { slug: data.shopSlug, approvalStatus: "APPROVED" } });
      if (!shop || !shop.isOpen) throw new Error("à¸£à¹‰à¸²à¸™à¸›à¸´à¸”à¸£à¸±à¸šà¸­à¸­à¹€à¸”à¸­à¸£à¹Œà¸­à¸¢à¸¹à¹ˆ");
      const member = await getCurrentCustomerMember(shop.id);
      const today = todayDateOnly();
      const schedule = await tx.shopDaySchedule.findUnique({
        where: { shopId_date: { shopId: shop.id, date: today } },
      });
      const scheduleState = getScheduleState(schedule);
      if (!scheduleState.canOrder) throw new Error(scheduleState.message);

      const menuIds = data.items.map((item) => item.menuId);
      const menus = await tx.menu.findMany({
        where: {
          id: { in: menuIds },
          shopId: shop.id,
          availableDate: today,
          isTemplate: false,
          isAvailable: true,
        },
      });

      if (menus.length !== menuIds.length) throw new Error("à¸¡à¸µà¹€à¸¡à¸™à¸¹à¸—à¸µà¹ˆà¹„à¸¡à¹ˆà¸žà¸£à¹‰à¸­à¸¡à¸‚à¸²à¸¢");

      const items = data.items.map((item) => {
        const menu = menus.find((entry) => entry.id === item.menuId);
        if (!menu) throw new Error("à¹„à¸¡à¹ˆà¸žà¸šà¹€à¸¡à¸™à¸¹");
        if (menu.stockQty > 0 && menu.stockQty < item.quantity) throw new Error(`${menu.name} เหลือไม่พอ`);
        return { menu, quantity: item.quantity, note: item.note };
      });

      const subtotal = items.reduce((sum, item) => sum + item.menu.price.toNumber() * item.quantity, 0);
      const deliveryFee = shop.deliveryFee.toNumber();
      const totalPrice = subtotal + deliveryFee;
      const created = await tx.order.create({
        data: {
          shopId: shop.id,
          memberId: member?.id,
          orderCode: await createOrderCode(tx),
          trackingToken: randomUUID(),
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          deliveryAddress: data.deliveryAddress,
          deliveryNote: data.deliveryNote,
          subtotal,
          deliveryFee,
          totalPrice,
          paymentStatus: PaymentStatus.pending,
          orderStatus: OrderStatus.pending_payment,
          items: {
            create: items.map((item) => ({
              menuId: item.menu.id,
              menuName: item.menu.name,
              quantity: item.quantity,
              price: item.menu.price,
              note: item.note,
            })),
          },
          payment: {
            create: {
              amount: totalPrice,
              status: PaymentStatus.pending,
            },
          },
        },
        include: { items: true, payment: true, shop: true },
      });

      for (const item of items) {
        await tx.menu.update({
          where: { id: item.menu.id },
          data: {
            ...(item.menu.stockQty > 0 ? { stockQty: { decrement: item.quantity } } : {}),
            soldQty: { increment: item.quantity },
          },
        });
      }

      if (member) {
        await tx.customerMember.update({
          where: { id: member.id },
          data: {
            name: data.customerName,
            phone: data.customerPhone,
            deliveryAddress: data.deliveryAddress,
            deliveryNote: data.deliveryNote,
            totalOrders: { increment: 1 },
            totalSpent: { increment: totalPrice },
            lastOrderedAt: created.createdAt,
          },
        });
      }

      await logOrderStatus(tx, created.id, null, OrderStatus.pending_payment, "à¸ªà¸£à¹‰à¸²à¸‡à¸­à¸­à¹€à¸”à¸­à¸£à¹Œ");
      return created;
    });

    return ok(decimalToNumber(order), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  return fail("à¹ƒà¸Šà¹‰ POST à¹€à¸žà¸·à¹ˆà¸­à¸ªà¸£à¹‰à¸²à¸‡à¸­à¸­à¹€à¸”à¸­à¸£à¹Œ", 405);
}
