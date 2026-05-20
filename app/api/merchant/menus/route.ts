import { decimalToNumber, handleApiError, ok } from "@/lib/api";
import { requireMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveImageUpload } from "@/lib/upload";
import { menuSchema } from "@/lib/validators";

async function readMenuForm(request: Request) {
  const type = request.headers.get("content-type") ?? "";
  if (type.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("image");
    const imageUrl = file instanceof File && file.size > 0 ? await saveImageUpload(file, "menus") : String(form.get("imageUrl") ?? "");
    return {
      name: form.get("name"),
      description: form.get("description"),
      price: form.get("price"),
      imageUrl,
      availableDate: form.get("availableDate"),
      stockQty: form.get("stockQty"),
      isAvailable: form.get("isAvailable") !== "false",
    };
  }
  return request.json();
}

export async function GET() {
  try {
    const merchant = await requireMerchant();
    const menus = await prisma.menu.findMany({
      where: { shopId: merchant.shop!.id },
      orderBy: [{ availableDate: "desc" }, { createdAt: "desc" }],
    });
    return ok(decimalToNumber(menus));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const merchant = await requireMerchant();
    const data = menuSchema.parse(await readMenuForm(request));
    const menu = await prisma.menu.create({
      data: {
        ...data,
        imageUrl: data.imageUrl || null,
        shopId: merchant.shop!.id,
      },
    });
    return ok(decimalToNumber(menu), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
