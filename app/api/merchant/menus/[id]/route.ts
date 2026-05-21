import { decimalToNumber, fail, handleApiError, ok } from "@/lib/api";
import { requireMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveImageUpload } from "@/lib/upload";
import { menuCatalogSchema, menuSchema } from "@/lib/validators";

async function readMenuUpdate(request: Request) {
  const type = request.headers.get("content-type") ?? "";
  if (type.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("image");
    const imageUrl = file instanceof File && file.size > 0 ? await saveImageUpload(file, "menus") : form.get("imageUrl");

    return {
      name: form.get("name") || undefined,
      description: form.get("description") || undefined,
      price: form.get("price") || undefined,
      imageUrl: imageUrl === null ? undefined : imageUrl,
      isAvailable: form.has("isAvailable") ? form.get("isAvailable") !== "false" : undefined,
    };
  }
  return request.json();
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const merchant = await requireMerchant();
    const { id } = await params;
    const existing = await prisma.menu.findFirst({ where: { id, shopId: merchant.shop!.id } });
    if (!existing) return fail("ไม่พบเมนู", 404);

    const raw = await readMenuUpdate(request);
    const data = existing.isTemplate ? menuCatalogSchema.partial().parse(raw) : menuSchema.partial().parse(raw);
    const menu = await prisma.menu.update({
      where: { id },
      data: {
        ...data,
        imageUrl: data.imageUrl === "" ? null : data.imageUrl,
      },
    });

    return ok(decimalToNumber(menu));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const merchant = await requireMerchant();
    const { id } = await params;
    const existing = await prisma.menu.findFirst({ where: { id, shopId: merchant.shop!.id } });
    if (!existing) return fail("ไม่พบเมนู", 404);
    await prisma.menu.delete({ where: { id } });
    return ok({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
