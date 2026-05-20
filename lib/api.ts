import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export function ok(data: unknown, init?: ResponseInit) {
  return Response.json(data, init);
}

export function fail(message: string, status = 400) {
  return Response.json({ message }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof Response) return error;
  if (error instanceof ZodError) return fail(error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง", 422);
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return fail("ข้อมูลนี้ถูกใช้งานแล้ว", 409);
  }
  if (error instanceof Error) return fail(error.message, 400);
  return fail("เกิดข้อผิดพลาด", 500);
}

export function decimalToNumber<T>(value: T): any {
  return JSON.parse(
    JSON.stringify(value, (_key, current) => {
      if (current && typeof current === "object" && "toNumber" in current) {
        return current.toNumber();
      }
      return current;
    }),
  );
}
