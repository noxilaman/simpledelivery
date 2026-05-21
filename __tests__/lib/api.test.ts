import { describe, it, expect } from "vitest";
import { z } from "zod";
import { ok, fail, decimalToNumber, handleApiError } from "@/lib/api";

describe("fail", () => {
  it("returns 400 by default", async () => {
    const res = fail("something wrong");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ message: "something wrong" });
  });

  it("uses custom status code", async () => {
    const res = fail("not found", 404);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toEqual({ message: "not found" });
  });

  it("returns 409 when passed", async () => {
    const res = fail("duplicate", 409);
    expect(res.status).toBe(409);
  });
});

describe("ok", () => {
  it("returns 200 with JSON body", async () => {
    const res = ok({ id: 1, name: "test" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ id: 1, name: "test" });
  });

  it("returns 200 for arrays", async () => {
    const res = ok([1, 2, 3]);
    const body = await res.json();
    expect(body).toEqual([1, 2, 3]);
  });
});

describe("decimalToNumber", () => {
  it("passes through plain numbers unchanged", () => {
    expect(decimalToNumber(42)).toBe(42);
    expect(decimalToNumber(0)).toBe(0);
  });

  it("passes through strings unchanged", () => {
    expect(decimalToNumber("hello")).toBe("hello");
  });

  it("converts a Decimal-like object with toNumber()", () => {
    const decimal = { toNumber: () => 99.5 };
    expect(decimalToNumber(decimal)).toBe(99.5);
  });

  it("converts Decimal-like objects nested in a plain object", () => {
    const obj = { price: { toNumber: () => 150 }, name: "pad thai" };
    expect(decimalToNumber(obj)).toEqual({ price: 150, name: "pad thai" });
  });

  it("converts Decimal-like objects in arrays", () => {
    const arr = [{ price: { toNumber: () => 50 } }, { price: { toNumber: () => 80 } }];
    expect(decimalToNumber(arr)).toEqual([{ price: 50 }, { price: 80 }]);
  });

  it("leaves plain objects with no toNumber untouched", () => {
    const obj = { a: 1, b: "two" };
    expect(decimalToNumber(obj)).toEqual({ a: 1, b: "two" });
  });
});

describe("handleApiError", () => {
  it("passes through a Response object as-is", () => {
    const res = new Response("custom", { status: 403 });
    expect(handleApiError(res)).toBe(res);
  });

  it("handles ZodError with status 422", async () => {
    const schema = z.object({ name: z.string().min(5) });
    const result = schema.safeParse({ name: "x" });
    const res = handleApiError((result as any).error);
    expect(res.status).toBe(422);
  });

  it("handles generic Error with message and status 400", async () => {
    const res = handleApiError(new Error("something went wrong"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe("something went wrong");
  });

  it("handles unknown thrown value with status 500", async () => {
    const res = handleApiError("unexpected string");
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.message).toBe("เกิดข้อผิดพลาด");
  });
});
