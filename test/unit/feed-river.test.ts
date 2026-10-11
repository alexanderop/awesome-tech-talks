import { describe, expect, it } from "vitest";
import type { FeedItem } from "#shared/utils/feed";
import { filterFeedItems, getFeedSources, groupFeedByDay, hasClockTime } from "~/utils/feed-river";

function item(source: string, date: string | null, title = `${source} post`): FeedItem {
  return { title, url: `https://example.com/${encodeURIComponent(title)}-${date}`, date, source, sourceUrl: "https://example.com" };
}

const items = [
  item("Julia Evans", "2026-10-11T08:00:00.000Z"),
  item("antirez", "2026-10-10T09:00:00.000Z"),
  item("Julia Evans", "2026-10-10T07:00:00.000Z", "Second Julia post"),
  item("Åsa Öberg", null),
];

describe("filterFeedItems", () => {
  it("returns everything without a source", () => {
    expect(filterFeedItems(items, {})).toHaveLength(4);
  });

  it("filters by source slug", () => {
    expect(filterFeedItems(items, { source: "julia-evans" }).map(entry => entry.title)).toEqual(["Julia Evans post", "Second Julia post"]);
  });

  it("matches nothing for an unknown source", () => {
    expect(filterFeedItems(items, { source: "nobody" })).toEqual([]);
  });
});

describe("getFeedSources", () => {
  it("counts items per source, sorted by name", () => {
    expect(getFeedSources(items)).toEqual([
      { slug: "antirez", name: "antirez", count: 1 },
      { slug: "asa-oberg", name: "Åsa Öberg", count: 1 },
      { slug: "julia-evans", name: "Julia Evans", count: 2 },
    ]);
  });
});

describe("groupFeedByDay", () => {
  const now = Date.parse("2026-10-11T12:00:00.000Z");

  it("labels today and yesterday and keeps the newest-first order", () => {
    const days = groupFeedByDay(items, now);
    expect(days.map(day => [day.key, day.label, day.items.length])).toEqual([
      ["2026-10-11", "Today", 1],
      ["2026-10-10", "Yesterday", 2],
      ["undated", "Undated", 1],
    ]);
  });

  it("labels older days with weekday and date", () => {
    const days = groupFeedByDay([item("a", "2026-10-05T10:00:00.000Z")], now);
    expect(days[0]!.label).toBe("Monday, 5 Oct");
  });

  it("adds the year for days outside the current year", () => {
    const days = groupFeedByDay([item("a", "2025-12-31T10:00:00.000Z")], now);
    expect(days[0]!.label).toBe("Wednesday, 31 Dec 2025");
  });

  it("groups by the site timezone, not UTC", () => {
    // 23:30 UTC on the 10th is already the 11th in Europe/Berlin.
    const days = groupFeedByDay([item("a", "2026-10-10T23:30:00.000Z")], now);
    expect(days[0]).toMatchObject({ key: "2026-10-11", label: "Today" });
  });

  it("returns no groups for no items", () => {
    expect(groupFeedByDay([], now)).toEqual([]);
  });
});

describe("hasClockTime", () => {
  it("is false for undated posts and for date-only feeds that report midnight UTC", () => {
    expect(hasClockTime({ date: null })).toBe(false);
    expect(hasClockTime({ date: "2026-10-05T00:00:00.000Z" })).toBe(false);
  });

  it("is true when the feed gives a time", () => {
    expect(hasClockTime({ date: "2026-10-05T08:15:00.000Z" })).toBe(true);
  });
});
