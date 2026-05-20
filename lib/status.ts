import type { OrderStatus, PaymentStatus } from "@prisma/client";

export const deliveryFee = 20;

export const orderStatusLabels: Record<OrderStatus | string, string> = {
  pending_payment: "รอชำระเงิน",
  payment_submitted: "ส่งหลักฐานโอนเงินแล้ว",
  payment_verified: "ตรวจสอบเงินเรียบร้อย",
  accepted: "ร้านรับออเดอร์แล้ว",
  cooking: "กำลังทำอาหาร",
  ready_to_deliver: "พร้อมส่ง",
  delivering: "กำลังจัดส่ง",
  completed: "ส่งสำเร็จ",
  cancelled: "ยกเลิก",
};

export const paymentStatusLabels: Record<PaymentStatus | string, string> = {
  pending: "รอชำระเงิน",
  submitted: "รอตรวจสลิป",
  verified: "ชำระเงินแล้ว",
  rejected: "สลิปไม่ผ่าน",
};

export const orderFlow: OrderStatus[] = [
  "pending_payment",
  "payment_submitted",
  "payment_verified",
  "accepted",
  "cooking",
  "ready_to_deliver",
  "delivering",
  "completed",
];

export const statusTone: Record<OrderStatus | string, string> = {
  pending_payment: "bg-amber-100 text-amber-800",
  payment_submitted: "bg-blue-100 text-blue-800",
  payment_verified: "bg-emerald-100 text-emerald-800",
  accepted: "bg-teal-100 text-teal-800",
  cooking: "bg-orange-100 text-orange-800",
  ready_to_deliver: "bg-cyan-100 text-cyan-800",
  delivering: "bg-indigo-100 text-indigo-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-rose-100 text-rose-800",
};
