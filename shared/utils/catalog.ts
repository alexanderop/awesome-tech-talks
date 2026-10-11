import { slugifyStr } from "./routes";

/** Helpers shared by every curated collection (talks and articles). */

export type Level = "beginner" | "intermediate" | "advanced";

export interface Resource {
  label: string;
  url: string;
}

export interface TagCount {
  /** URL slug used in `?tag=`. */
  tag: string;
  /** Display label. */
  tagName: string;
  count: number;
}

export function sortByAddedAt<T extends { addedAt: string }>(items: readonly T[]): T[] {
  return items.toSorted((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
}

/** True when an item carries the tag whose URL slug is `slug`. */
export function hasTag(item: { tags: readonly string[] }, slug: string): boolean {
  return item.tags.some(tag => slugifyStr(tag) === slug);
}

/** True when `names` (speakers or authors) contains the person whose URL slug is `slug`. */
export function hasPerson(names: readonly string[], slug: string): boolean {
  return names.some(name => slugifyStr(name) === slug);
}

/** De-duplicated tags across items, counted once per item and sorted by slug. */
export function countTags(items: readonly { tags: readonly string[] }[]): TagCount[] {
  const seen = new Map<string, TagCount>();
  for (const item of items) {
    for (const tag of new Set(item.tags.map(slugifyStr))) {
      const tagName = item.tags.find(name => slugifyStr(name) === tag) ?? tag;
      const entry = seen.get(tag) ?? { tag, tagName, count: 0 };
      entry.count += 1;
      seen.set(tag, entry);
    }
  }
  return [...seen.values()].toSorted((a, b) => a.tag.localeCompare(b.tag));
}

export interface SiteTag extends TagCount {
  talkCount: number;
  articleCount: number;
}

/** Tags across talks and articles; `count` is the total, split into `talkCount` and `articleCount`. */
export function countSiteTags(
  talks: readonly { tags: readonly string[] }[],
  articles: readonly { tags: readonly string[] }[]
): SiteTag[] {
  const merged = new Map<string, SiteTag>();
  for (const [kind, items] of [
    ["talkCount", talks],
    ["articleCount", articles],
  ] as const) {
    for (const { tag, tagName, count } of countTags(items)) {
      const entry = merged.get(tag) ?? { tag, tagName, count: 0, talkCount: 0, articleCount: 0 };
      entry[kind] += count;
      entry.count += count;
      merged.set(tag, entry);
    }
  }
  return [...merged.values()].toSorted((a, b) => a.tag.localeCompare(b.tag));
}
