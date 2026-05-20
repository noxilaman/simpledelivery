import { appTimeZone } from "@/lib/format";

type ScheduleLike = {
  openTime: string;
  closeTime: string;
  isClosed: boolean;
} | null;

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function nowMinutesInTimeZone(date = new Date(), timeZone = appTimeZone()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const hour = Number(parts.find((part) => part.type === "hour")?.value);
  const minute = Number(parts.find((part) => part.type === "minute")?.value);

  return hour * 60 + minute;
}

export function getScheduleState(schedule: ScheduleLike, date = new Date()) {
  if (!schedule) {
    return {
      canViewMenu: true,
      canOrder: true,
      message: "เปิดรับออเดอร์ตลอดวัน",
    };
  }

  if (schedule.isClosed) {
    return {
      canViewMenu: false,
      canOrder: false,
      message: "ร้านปิดรับออเดอร์วันนี้",
    };
  }

  const now = nowMinutesInTimeZone(date);
  const open = timeToMinutes(schedule.openTime);
  const close = timeToMinutes(schedule.closeTime);
  const previewStart = Math.max(0, open - 60);
  const spansMidnight = close <= open;

  const canOrder = spansMidnight ? now >= open || now < close : now >= open && now < close;
  const canViewMenu = spansMidnight ? now >= previewStart || now < close : now >= previewStart;

  let message = `เปิดรับออเดอร์ ${schedule.openTime} - ${schedule.closeTime}`;
  if (!canViewMenu) message = `เมนูวันนี้จะดูได้ตั้งแต่ ${minutesToTime(previewStart)} น.`;
  else if (!canOrder && now < open) message = `ดูเมนูล่วงหน้าได้แล้ว เริ่มสั่งได้เวลา ${schedule.openTime} น.`;
  else if (!canOrder) message = "ร้านปิดรับออเดอร์แล้ว";

  return {
    canViewMenu,
    canOrder,
    message,
  };
}

function minutesToTime(value: number) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
