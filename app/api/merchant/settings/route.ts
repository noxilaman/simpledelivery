import { decimalToNumber, handleApiError, ok } from "@/lib/api";
import { requireMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveImageUpload } from "@/lib/upload";
import { deliverySettingsSchema } from "@/lib/validators";

export async function PATCH(request: Request) {
  try {
    const merchant = await requireMerchant();
    const type = request.headers.get("content-type") ?? "";
    const data: { logoUrl?: string | null; isOpen?: boolean; deliveryFee?: number; deliveryNote?: string | null } = {};

    if (type.includes("multipart/form-data")) {
      const form = await request.formData();
      const logo = form.get("logo");
      if (logo instanceof File && logo.size > 0) {
        data.logoUrl = await saveImageUpload(logo, "shops");
      }
      if (form.has("isOpen")) {
        data.isOpen = form.get("isOpen") === "true";
      }
    } else {
      const body = await request.json();
      if (typeof body.logoUrl === "string") data.logoUrl = body.logoUrl || null;
      if (typeof body.isOpen === "boolean") data.isOpen = body.isOpen;
      if ("deliveryFee" in body || "deliveryNote" in body) {
        const delivery = deliverySettingsSchema.parse(body);
        data.deliveryFee = delivery.deliveryFee;
        data.deliveryNote = delivery.deliveryNote || null;
      }
    }

    const shop = await prisma.shop.update({
      where: { id: merchant.shop!.id },
      data,
    });

    return ok(decimalToNumber(shop));
  } catch (error) {
    return handleApiError(error);
  }
}
