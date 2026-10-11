import { SITE } from "./site";

/**
 * Nuxt Content generates `z.date()` frontmatter fields as
 * `string | { [k: string]: unknown }`, but at runtime they are ISO strings.
 */
export type ContentDatetime = string | number | Date | { [k: string]: unknown };

export function toDate(value: ContentDatetime): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    return new Date(value);
  }
  return new Date(String(value));
}

const DAY_MS = 86_400_000;

/** Calendar day (`YYYY-MM-DD`) of a moment in the site timezone. */
export function dayKey(value: ContentDatetime, timeZone: string = SITE.timezone): string {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(toDate(value));
  const part = (type: string) => parts.find(entry => entry.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

/** Whole calendar days from one `dayKey` to another (positive when `to` is later). */
export function dayDiff(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * "Mon 5 Oct" style label for a `dayKey`. Written out by hand instead of via
 * Intl so the prerendered HTML and the browser always agree.
 */
export function formatDayKey(key: string, options: { weekday?: boolean; year?: boolean } = {}): string {
  const [year, month, day] = key.split("-").map(Number) as [number, number, number];
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()]!;
  const date = `${day} ${MONTHS[month - 1]}${options.year ? ` ${year}` : ""}`;
  return options.weekday ? `${weekday}, ${date}` : date;
}

/** 24-hour "14:32" clock time in the site timezone. */
export function formatClock(value: ContentDatetime, timeZone: string = SITE.timezone): string {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(toDate(value));
  const part = (type: string) => parts.find(entry => entry.type === type)?.value ?? "";
  return `${part("hour")}:${part("minute")}`;
}

/** "3 hours ago" / "yesterday" for a past moment, measured against `now`. */
export function formatRelativeTime(value: ContentDatetime, now: number): string {
  const seconds = Math.round((toDate(value).getTime() - now) / 1000);
  const formatter = new Intl.RelativeTimeFormat(SITE.lang, { numeric: "auto" });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [["day", 86_400], ["hour", 3600], ["minute", 60]];
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) return formatter.format(Math.trunc(seconds / size), unit);
  }
  return formatter.format(0, "second");
}
