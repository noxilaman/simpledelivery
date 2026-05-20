import { hashPassword, setMerchantSession } from "@/lib/auth";
import { handleApiError, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const data = registerSchema.parse(await request.json());
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: await hashPassword(data.password),
        shop: {
          create: {
            name: data.shopName,
            slug: data.slug,
            phone: data.phone,
            promptpayId: data.promptpayId,
            bankAccountName: data.bankAccountName,
            address: data.address,
            approvalStatus: "PENDING",
            isOpen: false,
          },
        },
      },
      include: { shop: true },
    });

    await setMerchantSession(user.id);
    return ok({ user: { id: user.id, email: user.email, role: user.role }, shop: user.shop });
  } catch (error) {
    return handleApiError(error);
  }
}
