import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

import { saveImageUpload } from "@/lib/upload";
import { mkdir, writeFile } from "fs/promises";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("saveImageUpload", () => {
  it("throws for unsupported MIME type (gif)", async () => {
    const file = new File(["content"], "image.gif", { type: "image/gif" });
    await expect(saveImageUpload(file, "menus")).rejects.toThrow("รองรับเฉพาะไฟล์ jpg, png หรือ webp");
  });

  it("throws for unsupported MIME type (pdf)", async () => {
    const file = new File(["content"], "document.pdf", { type: "application/pdf" });
    await expect(saveImageUpload(file, "slips")).rejects.toThrow("รองรับเฉพาะไฟล์ jpg, png หรือ webp");
  });

  it("throws when file exceeds 5 MB", async () => {
    const bigContent = new Uint8Array(5 * 1024 * 1024 + 1);
    const file = new File([bigContent], "big.jpg", { type: "image/jpeg" });
    await expect(saveImageUpload(file, "menus")).rejects.toThrow("ไม่เกิน 5MB");
  });

  it("accepts a valid jpeg and returns the upload path", async () => {
    const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });
    const result = await saveImageUpload(file, "menus");
    expect(result).toMatch(/^\/uploads\/menus\/.+\.jpg$/);
  });

  it("accepts a valid png and returns the upload path", async () => {
    const file = new File(["data"], "image.png", { type: "image/png" });
    const result = await saveImageUpload(file, "slips");
    expect(result).toMatch(/^\/uploads\/slips\/.+\.png$/);
  });

  it("accepts a valid webp and returns the upload path", async () => {
    const file = new File(["data"], "image.webp", { type: "image/webp" });
    const result = await saveImageUpload(file, "shops");
    expect(result).toMatch(/^\/uploads\/shops\/.+\.webp$/);
  });

  it("calls mkdir with recursive option", async () => {
    const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });
    await saveImageUpload(file, "menus");
    expect(mkdir).toHaveBeenCalledWith(expect.stringContaining("menus"), { recursive: true });
  });

  it("calls writeFile once per upload", async () => {
    const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });
    await saveImageUpload(file, "menus");
    expect(writeFile).toHaveBeenCalledTimes(1);
  });
});
