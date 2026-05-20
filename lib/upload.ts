import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const maxFileSize = 5 * 1024 * 1024;
const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function saveImageUpload(file: File, folder: "menus" | "slips" | "shops") {
  const ext = allowedTypes.get(file.type);
  if (!ext) {
    throw new Error("รองรับเฉพาะไฟล์ jpg, png หรือ webp");
  }

  if (file.size > maxFileSize) {
    throw new Error("ไฟล์ต้องมีขนาดไม่เกิน 5MB");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });

  const filename = `${Date.now()}-${randomUUID()}.${ext}`;
  await writeFile(path.join(dir, filename), buffer);

  return `/uploads/${folder}/${filename}`;
}
