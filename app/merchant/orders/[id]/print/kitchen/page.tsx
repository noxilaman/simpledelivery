import { notFound, redirect } from "next/navigation";
import { decimalToNumber } from "@/lib/api";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PrintableOrder } from "@/components/print/PrintableOrder";

export default async function KitchenPrintPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ paper?: string }> }) {
  const merchant = await getCurrentMerchant();
  if (!merchant?.shop) redirect("/merchant/login");
  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, shopId: merchant.shop.id },
    include: { items: true },
  });
  if (!order) notFound();

  const query = await searchParams;
  return <PrintableOrder type="kitchen" paper={query.paper === "58" ? "58" : "80"} order={decimalToNumber(order)} shop={decimalToNumber(merchant.shop)} />;
}
