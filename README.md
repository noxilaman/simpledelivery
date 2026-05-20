# SimpleDelivery

เว็บแอป MVP สำหรับร้านอาหารไม่มีหน้าร้าน ร้าน Cloud Kitchen และร้านรับพรีออเดอร์ ลูกค้าสั่งอาหารได้โดยไม่ต้องสมัครสมาชิก ชำระผ่าน PromptPay QR อัปโหลดสลิป และติดตามสถานะออเดอร์

## Tech Stack

- Next.js App Router
- Next.js API Routes
- Prisma ORM
- MySQL
- Tailwind CSS
- Local file storage สำหรับรูปเมนูและสลิป
- bcryptjs สำหรับ hash password
- JWT cookie สำหรับ session ร้านค้า
- promptpay-qr + qrcode สำหรับสร้าง QR ชำระเงิน

## Setup

1. ติดตั้ง dependencies

```bash
npm install
```

2. สร้างไฟล์ `.env`

```bash
cp .env.example .env
```

แก้ `DATABASE_URL` ให้ตรงกับ MySQL ของเครื่อง เช่น

```env
DATABASE_URL="mysql://root:password@localhost:3306/simple_delivery"
JWT_SECRET="change-this-secret-before-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

3. สร้าง database ใน MySQL

```sql
CREATE DATABASE simple_delivery CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. สร้างตารางและ seed data

```bash
npx prisma migrate dev
npx prisma db seed
```

5. รันระบบ

```bash
npm run dev
```

เปิดใช้งานที่ `http://localhost:3000`

## บัญชีตัวอย่าง

- ร้าน: ครัวแม่มณี
- URL: `/shop/krua-mae-manee`
- Email: `demo@simpledelivery.local`
- Password: `password123`
- PromptPay: `0812345678`

## โครงสร้างหลัก

- `app/shop/[slug]` หน้าร้านสำหรับลูกค้า
- `app/checkout` ตะกร้าและข้อมูลจัดส่ง
- `app/payment/[orderId]` ชำระเงินและอัปโหลดสลิป
- `app/order/track/[trackingToken]` ติดตามสถานะ
- `app/merchant/*` หน้าร้านค้า
- `app/api/*` API routes ทั้ง public และ merchant
- `prisma/schema.prisma` schema ฐานข้อมูล
- `prisma/seed.ts` seed data ตัวอย่าง
- `public/uploads` ที่เก็บรูปสำหรับ MVP

## API สำคัญ

Public:

- `GET /api/shops/[slug]`
- `GET /api/shops/[slug]/menus`
- `POST /api/orders`
- `GET /api/orders/track/[trackingToken]`
- `POST /api/orders/[orderId]/upload-slip`
- `POST /api/orders/[orderId]/customer-complete`

Merchant:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/merchant/dashboard`
- `GET /api/merchant/orders`
- `GET /api/merchant/orders/[id]`
- `PATCH /api/merchant/orders/[id]/status`
- `POST /api/merchant/payments/[id]/verify`
- `POST /api/merchant/payments/[id]/reject`
- `GET /api/merchant/menus`
- `POST /api/merchant/menus`
- `PATCH /api/merchant/menus/[id]`
- `DELETE /api/merchant/menus/[id]`

## Business Logic

- สร้าง `orderCode` รูปแบบ `ORD-YYYYMMDD-0001`
- สร้าง `trackingToken` ด้วย UUID
- ตรวจ stock และสถานะเมนูก่อนสร้างออเดอร์
- ลด stock ทันทีเมื่อสร้างออเดอร์เพื่อกันขายเกินจำนวน
- ทุกครั้งที่เปลี่ยนสถานะจะบันทึก `OrderStatusLog`
- ลูกค้าดูออเดอร์ผ่าน `trackingToken`
- ร้านค้าดูเฉพาะออเดอร์ของร้านตัวเองจาก session
- จำกัดอัปโหลดสลิปเป็น jpg/png/webp และไม่เกิน 5MB
