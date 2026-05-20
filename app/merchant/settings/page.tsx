import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getCurrentMerchant } from "@/lib/auth";
import { MerchantShell } from "@/components/merchant/MerchantShell";
import { CopyShopLink } from "@/components/merchant/CopyShopLink";
import { ShopLogoUploader } from "@/components/merchant/ShopLogoUploader";
import { DeliverySettingsForm } from "@/components/merchant/DeliverySettingsForm";

export default async function MerchantSettingsPage() {
  const merchant = await getCurrentMerchant();
  if (!merchant?.shop) redirect("/merchant/login");
  const shopUrl = `/shop/${merchant.shop.slug}`;

  return (
    <MerchantShell title="ตั้งค่าร้าน">
      <div className="grid gap-5 lg:grid-cols-2">
        <ShopLogoUploader logoUrl={merchant.shop.logoUrl} shopName={merchant.shop.name} />
        <DeliverySettingsForm deliveryFee={merchant.shop.deliveryFee.toString()} deliveryNote={merchant.shop.deliveryNote} />

        <section className="panel space-y-3">
          <h2 className="font-bold">ข้อมูลร้าน</h2>
          <p><strong>ชื่อร้าน:</strong> {merchant.shop.name}</p>
          <p><strong>เบอร์โทร:</strong> {merchant.shop.phone}</p>
          <p><strong>PromptPay:</strong> {merchant.shop.promptpayId}</p>
          <p><strong>ชื่อบัญชี:</strong> {merchant.shop.bankAccountName}</p>
          <p><strong>ค่าจัดส่ง:</strong> {merchant.shop.deliveryFee.toString()} บาท</p>
          {merchant.shop.deliveryNote && <p><strong>หมายเหตุขนส่ง:</strong> {merchant.shop.deliveryNote}</p>}
          <p><strong>ที่อยู่:</strong> {merchant.shop.address}</p>
        </section>

        <section className="panel space-y-4">
          <h2 className="font-bold">ลิงก์สำหรับแชร์ให้ลูกค้า</h2>
          <div className="rounded-lg bg-stone-50 p-3 font-semibold">{shopUrl}</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href={shopUrl} className="tap flex items-center justify-center gap-2 bg-leaf text-white">
              <ExternalLink size={18} /> เปิดหน้าร้าน
            </Link>
            <CopyShopLink path={shopUrl} />
          </div>
        </section>
      </div>
    </MerchantShell>
  );
}
