import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SimpleDelivery",
  description: "ระบบสั่งอาหารออนไลน์สำหรับร้านอาหารไม่มีหน้าร้าน",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
