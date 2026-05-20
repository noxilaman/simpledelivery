import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  shopName: z.string().min(2),
  phone: z.string().min(8),
  promptpayId: z.string().min(10),
  bankAccountName: z.string().min(2),
  address: z.string().min(5),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "slug ต้องใช้ a-z, 0-9 และ - เท่านั้น"),
});

export const adminShopSchema = registerSchema.extend({
  approveNow: z.coerce.boolean().default(true),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const menuSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(1),
  price: z.coerce.number().positive(),
  imageUrl: z.string().optional().nullable(),
  availableDate: z.coerce.date(),
  stockQty: z.coerce.number().int().min(0),
  isAvailable: z.coerce.boolean().default(true),
});

export const planMenuSchema = z.object({
  sourceMenuId: z.string().min(1),
  availableDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/),
  stockQty: z.coerce.number().int().min(0),
});

export const dayScheduleSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/),
  openTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/),
  closeTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/),
  isClosed: z.coerce.boolean().default(false),
});

export const deliverySettingsSchema = z.object({
  deliveryFee: z.coerce.number().min(0),
  deliveryNote: z.string().optional().nullable(),
});

export const orderSchema = z.object({
  shopSlug: z.string().min(1),
  customerName: z.string().min(2),
  customerPhone: z.string().min(8),
  deliveryAddress: z.string().min(5),
  deliveryNote: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        menuId: z.string().min(1),
        quantity: z.number().int().min(1),
        note: z.string().optional().nullable(),
      }),
    )
    .min(1),
});
