export function formatMoney(value: number | string) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function thaiDate(value: Date | string) {
  return new Intl.DateTimeFormat("th-TH", {
    timeZone: appTimeZone(),
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function todayDateOnly() {
  return dateOnlyInTimeZone(new Date());
}

export function dateOnly(value: Date | string) {
  const date = new Date(value);
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

export function appTimeZone() {
  return process.env.APP_TIMEZONE || "Asia/Bangkok";
}

export function dateOnlyInTimeZone(value: Date | string, timeZone = appTimeZone()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  return new Date(Date.UTC(year, month - 1, day));
}

export function dateInputToDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export function dateOnlyToInput(value: Date) {
  return value.toISOString().slice(0, 10);
}
