import { fail, handleApiError, ok } from "@/lib/api";
import { setMerchantSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const data = loginSchema.parse(await request.json());
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
      include: { shop: true },
    });

    if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
      return fail("อีเมลหรือรหัสผ่านไม่ถูกต้อง", 401);
    }

    await setMerchantSession(user.id);
    return ok({ user: { id: user.id, email: user.email, role: user.role }, shop: user.shop });
  } catch (error) {
    return handleApiError(error);
  }
}
