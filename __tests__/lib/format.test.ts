import { describe, it, expect } from "vitest";
import {
  formatMoney,
  dateOnly,
  dateInputToDateOnly,
  dateOnlyToInput,
  dateOnlyInTimeZone,
  appTimeZone,
} from "@/lib/format";

describe("formatMoney", () => {
  it("formats a positive integer as Thai Baht", () => {
    const result = formatMoney(1500);
    expect(result).toContain("1,500");
  });

  it("formats zero", () => {
    const result = formatMoney(0);
    expect(result).toContain("0");
  });

  it("accepts a string number", () => {
    const result = formatMoney("2500");
    expect(result).toContain("2,500");
  });

  it("truncates decimals (maximumFractionDigits = 0)", () => {
    const result = formatMoney(99.9);
    expect(result).not.toContain(".");
  });
});

describe("dateOnly", () => {
  it("strips time and returns UTC midnight", () => {
    const d = dateOnly("2024-03-15T12:34:56Z");
    expect(d.getUTCFullYear()).toBe(2024);
    expect(d.getUTCMonth()).toBe(2); // 0-indexed: March = 2
    expect(d.getUTCDate()).toBe(15);
    expect(d.getUTCHours()).toBe(0);
    expect(d.getUTCMinutes()).toBe(0);
  });

  it("accepts a Date object", () => {
    const input = new Date("2025-12-25T08:00:00Z");
    const d = dateOnly(input);
    expect(d.getUTCFullYear()).toBe(2025);
    expect(d.getUTCMonth()).toBe(11); // December = 11
    expect(d.getUTCDate()).toBe(25);
  });
});

describe("dateInputToDateOnly", () => {
  it("converts YYYY-MM-DD to UTC midnight Date", () => {
    const d = dateInputToDateOnly("2024-06-01");
    expect(d.toISOString()).toBe("2024-06-01T00:00:00.000Z");
  });

  it("converts another date correctly", () => {
    const d = dateInputToDateOnly("2025-01-31");
    expect(d.toISOString()).toBe("2025-01-31T00:00:00.000Z");
  });
});

describe("dateOnlyToInput", () => {
  it("converts a UTC midnight Date to YYYY-MM-DD string", () => {
    const d = new Date("2024-06-01T00:00:00.000Z");
    expect(dateOnlyToInput(d)).toBe("2024-06-01");
  });

  it("works for end-of-year dates", () => {
    const d = new Date("2024-12-31T00:00:00.000Z");
    expect(dateOnlyToInput(d)).toBe("2024-12-31");
  });
});

describe("dateOnlyInTimeZone", () => {
  it("returns UTC midnight for a date in Asia/Bangkok", () => {
    // 2024-03-15 01:00 UTC = 2024-03-15 08:00 Bangkok (UTC+7)
    const result = dateOnlyInTimeZone(new Date("2024-03-15T01:00:00Z"), "Asia/Bangkok");
    expect(result.getUTCFullYear()).toBe(2024);
    expect(result.getUTCMonth()).toBe(2);
    expect(result.getUTCDate()).toBe(15);
    expect(result.getUTCHours()).toBe(0);
  });

  it("rolls over to next day when UTC date is ahead of Bangkok date", () => {
    // 2024-03-15 18:00 UTC = 2024-03-16 01:00 Bangkok (UTC+7)
    const result = dateOnlyInTimeZone(new Date("2024-03-15T18:00:00Z"), "Asia/Bangkok");
    expect(result.getUTCDate()).toBe(16);
  });

  it("stays on same day when Bangkok is still behind UTC midnight", () => {
    // 2024-03-15 23:59 UTC = 2024-03-16 06:59 Bangkok — Bangkok sees March 16
    const result = dateOnlyInTimeZone(new Date("2024-03-15T23:59:00Z"), "Asia/Bangkok");
    expect(result.getUTCDate()).toBe(16);
  });
});

describe("appTimeZone", () => {
  it("defaults to Asia/Bangkok when env var is unset", () => {
    const original = process.env.APP_TIMEZONE;
    delete process.env.APP_TIMEZONE;
    expect(appTimeZone()).toBe("Asia/Bangkok");
    if (original !== undefined) process.env.APP_TIMEZONE = original;
  });

  it("returns the value of APP_TIMEZONE env var when set", () => {
    process.env.APP_TIMEZONE = "Asia/Tokyo";
    expect(appTimeZone()).toBe("Asia/Tokyo");
    delete process.env.APP_TIMEZONE;
  });
});
