import type { FeedItem } from "#shared/utils/feed";
import { dayDiff, dayKey, formatDayKey } from "#shared/utils/date";
import { t } from "#shared/utils/i18n";
import { slugifyStr } from "#shared/utils/routes";

export interface FeedFilters {
  /** Source URL slug. */
  source?: string;
}

export interface FeedSourceCount {
  slug: string;
  name: string;
  count: number;
}

export interface FeedDay {
  /** `YYYY-MM-DD` in the site timezone, or "undated". */
  key: string;
  label: string;
  items: FeedItem[];
}

const UNDATED = "undated";

export function filterFeedItems<T extends Pick<FeedItem, "source">>(items: readonly T[], filters: FeedFilters): T[] {
  return items.filter(item => !filters.source || slugifyStr(item.source) === filters.source);
}

/** Sources that have at least one item, with their item counts, sorted alphabetically. */
export function getFeedSources(items: readonly Pick<FeedItem, "source">[]): FeedSourceCount[] {
  const sources = new Map<string, FeedSourceCount>();
  for (const { source } of items) {
    const slug = slugifyStr(source);
    const entry = sources.get(slug) ?? { slug, name: source, count: 0 };
    entry.count += 1;
    sources.set(slug, entry);
  }
  return [...sources.values()].toSorted((a, b) => a.name.localeCompare(b.name));
}

/**
 * Feeds that only publish a date report it as midnight UTC. Showing that as
 * "01:00" would be made up, so those posts get no clock time.
 */
export function hasClockTime(item: Pick<FeedItem, "date">): item is { date: string } {
  return item.date !== null && !item.date.endsWith("T00:00:00.000Z");
}

function dayLabel(key: string, today: string): string {
  if (key === UNDATED) return t.feed.undated;
  const age = dayDiff(key, today);
  if (age === 0) return t.feed.today;
  if (age === 1) return t.feed.yesterday;
  return formatDayKey(key, { weekday: true, year: key.slice(0, 4) !== today.slice(0, 4) });
}

/**
 * Groups items (already newest first) into site-timezone days. Items without
 * a date go last.
 */
export function groupFeedByDay(items: readonly FeedItem[], now: number): FeedDay[] {
  const today = dayKey(now);
  const days = new Map<string, FeedDay>();
  for (const item of items) {
    const key = item.date ? dayKey(item.date) : UNDATED;
    const day = days.get(key) ?? { key, label: dayLabel(key, today), items: [] };
    day.items.push(item);
    days.set(key, day);
  }
  return [...days.values()];
}
