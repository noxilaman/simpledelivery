import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function appTimeZone() {
  return process.env.APP_TIMEZONE || "Asia/Bangkok";
}

function dateOnlyInTimeZone(value: Date, timeZone = appTimeZone()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  return new Date(Date.UTC(year, month - 1, day));
}

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);
  const adminPasswordHash = await bcrypt.hash("admin123456", 12);
  const today = dateOnlyInTimeZone(new Date());

  await prisma.user.upsert({
    where: { email: "admin@simpledelivery.local" },
    update: {
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
    create: {
      email: "admin@simpledelivery.local",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "demo@simpledelivery.local" },
    update: {
      role: "MERCHANT",
      shop: {
        update: {
          approvalStatus: "APPROVED",
          approvedAt: new Date(),
          isOpen: true,
          deliveryFee: 20,
          deliveryNote: "จัดส่งในพื้นที่ใกล้เคียง ค่าจัดส่งเริ่มต้น 20 บาท",
        },
      },
    },
    create: {
      email: "demo@simpledelivery.local",
      passwordHash,
      role: "MERCHANT",
      shop: {
        create: {
          name: "ครัวแม่มณี",
          slug: "krua-mae-manee",
          phone: "081-234-5678",
          promptpayId: "0812345678",
          bankAccountName: "แม่มณี ใจดี",
          address: "ซอยตลาดเช้า รับออเดอร์ล่วงหน้าและจัดส่งในพื้นที่ใกล้เคียง",
          deliveryFee: 20,
          deliveryNote: "จัดส่งในพื้นที่ใกล้เคียง ค่าจัดส่งเริ่มต้น 20 บาท",
          logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop",
          isOpen: true,
          approvalStatus: "APPROVED",
          approvedAt: new Date(),
        },
      },
    },
    include: { shop: true },
  });

  const shop = user.shop!;
  const menus = [
    {
      name: "ข้าวกะเพราไก่",
      description: "กะเพราไก่ผัดแห้ง รสจัดแบบไทย เสิร์ฟพร้อมข้าวหอมมะลิ",
      price: 60,
      imageUrl: "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?q=80&w=800&auto=format&fit=crop",
    },
    {
      name: "ข้าวหมูทอดกระเทียม",
      description: "หมูหมักทอดกระเทียมกรอบ หอมพริกไทย กินง่ายทั้งเด็กและผู้ใหญ่",
      price: 65,
      imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=800&auto=format&fit=crop",
    },
    {
      name: "ข้าวไข่เจียวหมูสับ",
      description: "ไข่เจียวฟู หมูสับแน่น เสิร์ฟพร้อมซอสพริก",
      price: 50,
      imageUrl: "https://images.unsplash.com/photo-1625938146369-adc83368b679?q=80&w=800&auto=format&fit=crop",
    },
    {
      name: "ข้าวมันไก่",
      description: "ไก่นุ่ม ข้าวมันหอม น้ำจิ้มเต้าเจี้ยวสูตรร้าน",
      price: 55,
      imageUrl: "https://images.unsplash.com/photo-1598511757337-fe2cafc31ba0?q=80&w=800&auto=format&fit=crop",
    },
  ];

  for (const menu of menus) {
    const existing = await prisma.menu.findFirst({ where: { shopId: shop.id, name: menu.name } });
    if (existing) {
      await prisma.menu.update({
        where: { id: existing.id },
        data: {
          ...menu,
          availableDate: today,
          stockQty: existing.stockQty > 0 ? existing.stockQty : 30,
          isAvailable: true,
        },
      });
    } else {
      await prisma.menu.create({
        data: {
          shopId: shop.id,
          ...menu,
          availableDate: today,
          stockQty: 30,
          soldQty: 0,
          isAvailable: true,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
