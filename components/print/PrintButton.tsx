"use client";

import { Printer } from "lucide-react";

export function PrintButton({ label = "พิมพ์" }: { label?: string }) {
  return (
    <button onClick={() => window.print()} className="tap inline-flex items-center justify-center gap-2 bg-leaf text-white print:hidden">
      <Printer size={18} /> {label}
    </button>
  );
}
