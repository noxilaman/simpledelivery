import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  menuSchema,
  orderSchema,
  dayScheduleSchema,
  deliverySettingsSchema,
  memberRegisterSchema,
} from "@/lib/validators";

const validRegister = {
  email: "owner@example.com",
  password: "password123",
  shopName: "My Shop",
  phone: "0812345678",
  promptpayId: "0812345678",
  bankAccountName: "Test Owner",
  address: "123 Main Street, Bangkok",
  slug: "my-shop",
};

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    expect(registerSchema.safeParse(validRegister).success).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(registerSchema.safeParse({ ...validRegister, email: "notanemail" }).success).toBe(false);
  });

  it("rejects password shorter than 8 chars", () => {
    expect(registerSchema.safeParse({ ...validRegister, password: "short" }).success).toBe(false);
  });

  it("rejects slug with spaces", () => {
    expect(registerSchema.safeParse({ ...validRegister, slug: "my shop" }).success).toBe(false);
  });

  it("rejects slug with uppercase letters", () => {
    expect(registerSchema.safeParse({ ...validRegister, slug: "MyShop" }).success).toBe(false);
  });

  it("accepts slug with hyphens and numbers", () => {
    expect(registerSchema.safeParse({ ...validRegister, slug: "my-shop-2" }).success).toBe(true);
  });

  it("rejects slug shorter than 3 chars", () => {
    expect(registerSchema.safeParse({ ...validRegister, slug: "ab" }).success).toBe(false);
  });

  it("rejects short shopName", () => {
    expect(registerSchema.safeParse({ ...validRegister, shopName: "A" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
  });

  it("rejects empty password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });

  it("rejects missing email", () => {
    expect(loginSchema.safeParse({ password: "pass" }).success).toBe(false);
  });
});

const validMenu = {
  name: "Pad Thai",
  description: "Classic Thai noodle dish",
  price: 80,
  availableDate: new Date("2025-01-01"),
  stockQty: 10,
};

describe("menuSchema", () => {
  it("accepts valid menu data", () => {
    expect(menuSchema.safeParse(validMenu).success).toBe(true);
  });

  it("rejects name shorter than 2 chars", () => {
    expect(menuSchema.safeParse({ ...validMenu, name: "A" }).success).toBe(false);
  });

  it("rejects zero price", () => {
    expect(menuSchema.safeParse({ ...validMenu, price: 0 }).success).toBe(false);
  });

  it("rejects negative price", () => {
    expect(menuSchema.safeParse({ ...validMenu, price: -10 }).success).toBe(false);
  });

  it("rejects negative stockQty", () => {
    expect(menuSchema.safeParse({ ...validMenu, stockQty: -1 }).success).toBe(false);
  });

  it("accepts zero stockQty (out of stock)", () => {
    expect(menuSchema.safeParse({ ...validMenu, stockQty: 0 }).success).toBe(true);
  });

  it("accepts optional imageUrl as null", () => {
    expect(menuSchema.safeParse({ ...validMenu, imageUrl: null }).success).toBe(true);
  });
});

const validOrder = {
  shopSlug: "my-shop",
  customerName: "สมชาย ใจดี",
  customerPhone: "0812345678",
  deliveryAddress: "123 ถนนสุขุมวิท กรุงเทพ",
  items: [{ menuId: "menu-abc", quantity: 2 }],
};

describe("orderSchema", () => {
  it("accepts a valid order", () => {
    expect(orderSchema.safeParse(validOrder).success).toBe(true);
  });

  it("rejects empty items array", () => {
    expect(orderSchema.safeParse({ ...validOrder, items: [] }).success).toBe(false);
  });

  it("rejects item with quantity zero", () => {
    expect(orderSchema.safeParse({ ...validOrder, items: [{ menuId: "x", quantity: 0 }] }).success).toBe(false);
  });

  it("rejects item with negative quantity", () => {
    expect(orderSchema.safeParse({ ...validOrder, items: [{ menuId: "x", quantity: -1 }] }).success).toBe(false);
  });

  it("rejects short customerName", () => {
    expect(orderSchema.safeParse({ ...validOrder, customerName: "A" }).success).toBe(false);
  });

  it("rejects short deliveryAddress", () => {
    expect(orderSchema.safeParse({ ...validOrder, deliveryAddress: "123" }).success).toBe(false);
  });

  it("accepts optional deliveryNote", () => {
    expect(orderSchema.safeParse({ ...validOrder, deliveryNote: "Leave at door" }).success).toBe(true);
  });
});

describe("dayScheduleSchema", () => {
  const valid = { date: "2025-06-15", openTime: "08:00", closeTime: "20:00" };

  it("accepts valid schedule", () => {
    expect(dayScheduleSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects date with wrong format", () => {
    expect(dayScheduleSchema.safeParse({ ...valid, date: "15-06-2025" }).success).toBe(false);
  });

  it("rejects time with wrong format", () => {
    expect(dayScheduleSchema.safeParse({ ...valid, openTime: "8:00" }).success).toBe(false);
  });
});

describe("deliverySettingsSchema", () => {
  it("accepts zero delivery fee (free delivery)", () => {
    expect(deliverySettingsSchema.safeParse({ deliveryFee: 0 }).success).toBe(true);
  });

  it("rejects negative delivery fee", () => {
    expect(deliverySettingsSchema.safeParse({ deliveryFee: -10 }).success).toBe(false);
  });

  it("accepts optional deliveryNote", () => {
    expect(deliverySettingsSchema.safeParse({ deliveryFee: 20, deliveryNote: "Note here" }).success).toBe(true);
  });
});

describe("memberRegisterSchema", () => {
  const valid = {
    shopSlug: "my-shop",
    name: "สมหญิง",
    phone: "0812345678",
    password: "password123",
    deliveryAddress: "123 ถนนเพชรบุรี กรุงเทพ",
    acceptedTerms: true as const,
    acceptedPdpa: true as const,
  };

  it("accepts valid member registration", () => {
    expect(memberRegisterSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects when acceptedTerms is false", () => {
    expect(memberRegisterSchema.safeParse({ ...valid, acceptedTerms: false }).success).toBe(false);
  });

  it("rejects when acceptedPdpa is false", () => {
    expect(memberRegisterSchema.safeParse({ ...valid, acceptedPdpa: false }).success).toBe(false);
  });

  it("rejects password shorter than 8 chars", () => {
    expect(memberRegisterSchema.safeParse({ ...valid, password: "short" }).success).toBe(false);
  });
});
