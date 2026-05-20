import { notFound } from "next/navigation";
import { decimalToNumber } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { TrackClient } from "@/components/public/TrackClient";

export default async function TrackPage({ params }: { params: Promise<{ trackingToken: string }> }) {
  const { trackingToken } = await params;
  const order = await prisma.order.findUnique({
    where: { trackingToken },
    include: {
      items: true,
      statusLogs: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!order) notFound();

  return <TrackClient order={decimalToNumber(order)} />;
}
