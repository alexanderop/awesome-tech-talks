// RSS 2.0 / Atom parsing without dependencies. Used by the /api/feed.json
// build route and by scripts/discover-articles.mjs (Node strips the types).

export interface FeedEntry {
  title: string;
  url: string;
  /** ISO timestamp, or null when the feed gives no parseable date. */
  date: string | null;
}

export function parseFeed(xml: string, baseUrl?: string): FeedEntry[] {
  const entries: FeedEntry[] = [];
  // Atom uses <entry>, RSS uses <item>.
  for (const [entry] of xml.matchAll(/<(entry|item)[\s>][\s\S]*?<\/\1>/g)) {
    const title = feedText(entry.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]);
    const link = entry.match(/<link[^>]+rel=["']alternate["'][^>]*href=["']([^"']+)["']/)?.[1]
      ?? entry.match(/<link(?![^>]+rel=["'](?!alternate)[^"']*["'])[^>]+href=["']([^"']+)["']/)?.[1]
      ?? feedText(entry.match(/<link>([\s\S]*?)<\/link>/)?.[1])
      ?? feedText(entry.match(/<guid[^>]*isPermaLink=["']true["'][^>]*>([\s\S]*?)<\/guid>/)?.[1]);
    if (!title || !link) continue;
    const time = Date.parse(feedText(entry.match(/<(published|pubDate|updated|dc:date)>([\s\S]*?)<\/\1>/)?.[2]) ?? "");
    entries.push({
      title,
      url: resolveUrl(link, baseUrl),
      date: Number.isFinite(time) ? new Date(time).toISOString() : null,
    });
  }
  return entries;
}

function resolveUrl(link: string, baseUrl?: string): string {
  try {
    return new URL(link, baseUrl).href;
  } catch {
    return link;
  }
}

function feedText(value: string | undefined): string | undefined {
  const text = value
    ?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  return text || undefined;
}

export interface FeedSource {
  name: string;
  /** Site homepage. */
  url: string;
  /** RSS or Atom feed URL. */
  feed: string;
}

export interface FeedItem extends FeedEntry {
  source: string;
  sourceUrl: string;
}

export interface FeedStatus extends FeedSource {
  ok: boolean;
  error?: string;
}

export interface CollectedFeed {
  generatedAt: string;
  sources: FeedStatus[];
  items: FeedItem[];
}

/**
 * Fetches every feed, keeps the newest `perFeed` entries of each, and merges
 * them newest first. A failing feed is reported in `sources`, never thrown.
 */
export async function collectFeed(
  sources: FeedSource[],
  options: { perFeed: number; maxItems: number; now: Date },
  fetchText: (url: string) => Promise<string>,
): Promise<CollectedFeed> {
  const results = await Promise.all(sources.map(async source => {
    try {
      const entries = parseFeed(await fetchText(source.feed), source.feed)
        .toSorted((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
        .slice(0, options.perFeed);
      return { status: { ...source, ok: true }, items: entries.map(entry => Object.assign(entry, { source: source.name, sourceUrl: source.url })) };
    } catch (error) {
      return { status: { ...source, ok: false, error: error instanceof Error ? error.message : String(error) }, items: [] };
    }
  }));
  const seen = new Set<string>();
  const items = results.flatMap(result => result.items)
    // Future-dated entries (scheduled posts, bad clocks) would pin themselves to the top.
    .filter(item => !item.date || item.date <= options.now.toISOString())
    .filter(item => !seen.has(item.url) && seen.add(item.url))
    .toSorted((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
    .slice(0, options.maxItems);
  return { generatedAt: options.now.toISOString(), sources: results.map(result => result.status), items };
}

/**
 * True when two snapshots list the same sources and items. `generatedAt` is
 * ignored, so a refresh that finds nothing new leaves the committed file alone.
 */
export function sameFeedContent(a: CollectedFeed, b: CollectedFeed): boolean {
  return JSON.stringify([a.sources, a.items]) === JSON.stringify([b.sources, b.items]);
}
