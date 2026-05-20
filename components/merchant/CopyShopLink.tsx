"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

export function CopyShopLink({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}${path}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button onClick={copy} className="tap flex items-center justify-center gap-2 bg-white text-ink ring-1 ring-stone-200">
      <Copy size={18} /> {copied ? "คัดลอกแล้ว" : "คัดลอกลิงก์"}
    </button>
  );
}
