import { decimalToNumber, handleApiError, ok } from "@/lib/api";
import { requireMerchant } from "@/lib/auth";
import { dateInputToDateOnly, dateOnlyToInput, todayDateOnly } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { dayScheduleSchema, planMenuSchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const merchant = await requireMerchant();
    const url = new URL(request.url);
    const date = url.searchParams.get("date") || dateOnlyToInput(todayDateOnly());
    const availableDate = dateInputToDateOnly(date);

    const [plannedMenus, catalog, schedule] = await Promise.all([
      prisma.menu.findMany({
        where: { shopId: merchant.shop!.id, availableDate, isTemplate: false },
        orderBy: { createdAt: "desc" },
      }),
      prisma.menu.findMany({
        where: { shopId: merchant.shop!.id, isTemplate: true, isAvailable: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.shopDaySchedule.findUnique({
        where: { shopId_date: { shopId: merchant.shop!.id, date: availableDate } },
      }),
    ]);

    return ok(decimalToNumber({ date, plannedMenus, catalog, schedule }));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const merchant = await requireMerchant();
    const data = planMenuSchema.parse(await request.json());
    const availableDate = dateInputToDateOnly(data.availableDate);

    const source = await prisma.menu.findFirst({
      where: { id: data.sourceMenuId, shopId: merchant.shop!.id, isTemplate: true },
    });
    if (!source) throw new Error("ไม่พบเมนูต้นทาง");

    const existing = await prisma.menu.findFirst({
      where: {
        shopId: merchant.shop!.id,
        name: source.name,
        availableDate,
        isTemplate: false,
      },
    });

    const payload = {
      description: source.description,
      price: source.price,
      imageUrl: source.imageUrl,
      stockQty: data.stockQty,
      isAvailable: true,
    };

    const planned = existing
      ? await prisma.menu.update({
          where: { id: existing.id },
          data: payload,
        })
      : await prisma.menu.create({
          data: {
            shopId: merchant.shop!.id,
            isTemplate: false,
            name: source.name,
            availableDate,
            soldQty: 0,
            ...payload,
          },
        });

    return ok(decimalToNumber(planned), { status: existing ? 200 : 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const merchant = await requireMerchant();
    const data = dayScheduleSchema.parse(await request.json());
    const date = dateInputToDateOnly(data.date);

    const schedule = await prisma.shopDaySchedule.upsert({
      where: { shopId_date: { shopId: merchant.shop!.id, date } },
      create: {
        shopId: merchant.shop!.id,
        date,
        openTime: data.openTime,
        closeTime: data.closeTime,
        isClosed: data.isClosed,
      },
      update: {
        openTime: data.openTime,
        closeTime: data.closeTime,
        isClosed: data.isClosed,
      },
    });

    return ok(decimalToNumber(schedule));
  } catch (error) {
    return handleApiError(error);
  }
}
