import { describe, it, expect, vi } from "vitest";
import { createOrderCode, logOrderStatus } from "@/lib/orders";

function makeMockTx(orderCount: number) {
  return {
    order: { count: vi.fn().mockResolvedValue(orderCount) },
    orderStatusLog: { create: vi.fn().mockResolvedValue({ id: "log-1" }) },
  } as any;
}

describe("createOrderCode", () => {
  it("generates code with today's date prefix", async () => {
    const tx = makeMockTx(0);
    const code = await createOrderCode(tx);

    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");

    expect(code).toBe(`ORD-${y}${m}${d}-0001`);
  });

  it("pads the sequence number to 4 digits", async () => {
    const tx = makeMockTx(0);
    const code = await createOrderCode(tx);
    expect(code).toMatch(/-\d{4}$/);
  });

  it("increments sequence by 1 over the existing count", async () => {
    const tx = makeMockTx(9);
    const code = await createOrderCode(tx);
    expect(code).toMatch(/-0010$/);
  });

  it("handles large sequence numbers (>= 1000)", async () => {
    const tx = makeMockTx(999);
    const code = await createOrderCode(tx);
    expect(code).toMatch(/-1000$/);
  });

  it("queries order count using the date prefix", async () => {
    const tx = makeMockTx(0);
    await createOrderCode(tx);

    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    const expectedPrefix = `ORD-${y}${m}${d}`;

    expect(tx.order.count).toHaveBeenCalledWith({
      where: { orderCode: { startsWith: expectedPrefix } },
    });
  });
});

describe("logOrderStatus", () => {
  it("creates a status log with the provided fields", async () => {
    const tx = makeMockTx(0);
    await logOrderStatus(tx, "order-123", "pending_payment", "accepted", "Payment confirmed");

    expect(tx.orderStatusLog.create).toHaveBeenCalledWith({
      data: {
        orderId: "order-123",
        oldStatus: "pending_payment",
        newStatus: "accepted",
        note: "Payment confirmed",
      },
    });
  });

  it("accepts null oldStatus for the initial log entry", async () => {
    const tx = makeMockTx(0);
    await logOrderStatus(tx, "order-456", null, "pending_payment");

    expect(tx.orderStatusLog.create).toHaveBeenCalledWith({
      data: {
        orderId: "order-456",
        oldStatus: null,
        newStatus: "pending_payment",
        note: undefined,
      },
    });
  });

  it("returns the created log record", async () => {
    const tx = makeMockTx(0);
    const result = await logOrderStatus(tx, "order-789", null, "cooking");
    expect(result).toEqual({ id: "log-1" });
  });
});
