import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const cookieName = "merchant_token";
const memberCookieName = "customer_member_token";

function jwtSecret() {
  const secret = process.env.JWT_SECRET ?? "dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createMerchantToken(userId: string) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(jwtSecret());
}

export async function setMerchantSession(userId: string) {
  const token = await createMerchantToken(userId);
  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function getCurrentMerchant() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, jwtSecret());
    const userId = payload.userId;
    if (typeof userId !== "string") return null;

    return prisma.user.findUnique({
      where: { id: userId },
      include: { shop: true },
    });
  } catch {
    return null;
  }
}

export async function requireMerchant() {
  const merchant = await getCurrentMerchant();
  if (!merchant?.shop || merchant.role !== "MERCHANT") {
    throw new Response(JSON.stringify({ message: "กรุณาเข้าสู่ระบบร้านค้า" }), { status: 401 });
  }
  return merchant;
}

export async function requireAdmin() {
  const admin = await getCurrentMerchant();
  if (!admin || admin.role !== "ADMIN") {
    throw new Response(JSON.stringify({ message: "กรุณาเข้าสู่ระบบผู้ดูแล" }), { status: 401 });
  }
  return admin;
}

export async function clearMerchantSession() {
  (await cookies()).delete(cookieName);
}

export async function createCustomerMemberToken(memberId: string, shopId: string) {
  return new SignJWT({ memberId, shopId, kind: "customer_member" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(jwtSecret());
}

export async function setCustomerMemberSession(memberId: string, shopId: string) {
  const token = await createCustomerMemberToken(memberId, shopId);
  (await cookies()).set(memberCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function getCurrentCustomerMember(shopId: string) {
  const token = (await cookies()).get(memberCookieName)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, jwtSecret());
    if (payload.kind !== "customer_member") return null;
    if (payload.shopId !== shopId || typeof payload.memberId !== "string") return null;

    return prisma.customerMember.findFirst({
      where: { id: payload.memberId, shopId },
    });
  } catch {
    return null;
  }
}
