import { describe, expect, it } from "vitest";
import { dayDiff, dayKey, formatClock, formatDayKey, formatRelativeTime, toDate } from "#shared/utils/date";

describe("toDate", () => {
  it("passes Date instances through unchanged", () => {
    const input = new Date("2024-01-01T00:00:00Z");
    expect(toDate(input)).toBe(input);
  });

  it("parses ISO strings", () => {
    expect(toDate("2024-01-01T00:00:00Z").toISOString()).toBe(
      "2024-01-01T00:00:00.000Z"
    );
  });

  it("parses numeric epoch milliseconds", () => {
    const ms = Date.UTC(2024, 0, 1);
    expect(toDate(ms).getTime()).toBe(ms);
  });

  it("falls back to String() for object values", () => {
    // Objects stringify to "[object Object]", which is not a valid date.
    expect(Number.isNaN(toDate({ foo: "bar" }).getTime())).toBe(true);
  });
});

describe("site timezone helpers", () => {
  it("dayKey uses the site timezone", () => {
    expect(dayKey("2026-10-10T21:59:00Z")).toBe("2026-10-10");
    expect(dayKey("2026-10-10T22:00:00Z")).toBe("2026-10-11");
    expect(dayKey("2026-10-10T22:00:00Z", "UTC")).toBe("2026-10-10");
  });

  it("dayDiff counts calendar days across month ends and DST", () => {
    expect(dayDiff("2026-10-10", "2026-10-11")).toBe(1);
    expect(dayDiff("2026-09-30", "2026-10-01")).toBe(1);
    expect(dayDiff("2026-10-24", "2026-10-26")).toBe(2);
    expect(dayDiff("2026-10-11", "2026-10-10")).toBe(-1);
  });

  it("formatDayKey writes weekday, day and month by hand", () => {
    expect(formatDayKey("2026-10-05")).toBe("5 Oct");
    expect(formatDayKey("2026-10-05", { weekday: true })).toBe("Monday, 5 Oct");
    expect(formatDayKey("2025-12-31", { weekday: true, year: true })).toBe("Wednesday, 31 Dec 2025");
  });

  it("formatClock shows 24-hour time in the site timezone", () => {
    expect(formatClock("2026-10-11T00:52:00Z")).toBe("02:52");
    expect(formatClock("2026-01-11T23:05:00Z")).toBe("00:05");
  });

  it("formatRelativeTime picks the largest fitting unit", () => {
    const now = Date.parse("2026-10-11T12:00:00Z");
    expect(formatRelativeTime("2026-10-11T11:59:40Z", now)).toBe("now");
    expect(formatRelativeTime("2026-10-11T11:55:00Z", now)).toBe("5 minutes ago");
    expect(formatRelativeTime("2026-10-11T09:00:00Z", now)).toBe("3 hours ago");
    expect(formatRelativeTime("2026-10-10T12:00:00Z", now)).toBe("yesterday");
    expect(formatRelativeTime("2026-10-08T12:00:00Z", now)).toBe("3 days ago");
  });
});
