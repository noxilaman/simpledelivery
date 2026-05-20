import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MemberRegisterClient } from "@/components/public/MemberRegisterClient";

export default async function MemberRegisterPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ orderId?: string }> }) {
  const { slug } = await params;
  const query = await searchParams;
  const shop = await prisma.shop.findFirst({ where: { slug, approvalStatus: "APPROVED" } });
  if (!shop) notFound();

  const order = query.orderId
    ? await prisma.order.findFirst({
        where: { id: query.orderId, shopId: shop.id },
        select: {
          id: true,
          customerName: true,
          customerPhone: true,
          deliveryAddress: true,
          deliveryNote: true,
          memberId: true,
        },
      })
    : null;
  if (query.orderId && !order) notFound();

  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-rice px-5 py-6">
      <h1 className="text-2xl font-bold">สมัครสมาชิก {shop.name}</h1>
      <p className="mt-2 text-sm leading-6 text-stone-600">สมาชิกจะผูกกับร้านนี้ เพื่อเก็บข้อมูลจัดส่ง ประวัติการสั่ง และยอดสะสมสำหรับการสั่งครั้งต่อไป</p>
      {order?.memberId && <p className="mt-4 rounded-lg bg-amber-100 p-3 text-sm font-semibold text-amber-800">ออเดอร์นี้ผูกกับสมาชิกแล้ว</p>}
      <MemberRegisterClient
        shopSlug={shop.slug}
        orderId={order?.id}
        defaults={{
          name: order?.customerName ?? "",
          phone: order?.customerPhone ?? "",
          deliveryAddress: order?.deliveryAddress ?? "",
          deliveryNote: order?.deliveryNote ?? "",
        }}
      />
    </main>
  );
}
