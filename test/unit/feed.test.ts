import { describe, expect, it } from "vitest";
import { collectFeed, parseFeed, sameFeedContent } from "#shared/utils/feed";

const atom = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Blog</title>
  <link href="https://blog.example/" />
  <entry>
    <title type="html">Tom &amp; Jerry&#39;s &lt;guide&gt;</title>
    <link rel="replies" href="https://blog.example/a#comments" />
    <link rel="alternate" href="/a/" />
    <published>2026-10-06T00:00:00+00:00</published>
  </entry>
  <entry>
    <title>No date</title>
    <link href="https://blog.example/b/" />
  </entry>
</feed>`;

const rss = `<rss version="2.0"><channel>
  <item>
    <title><![CDATA[Hello <b>world</b>]]></title>
    <link>https://rss.example/hello</link>
    <pubDate>Fri, 10 Oct 2026 08:00:00 GMT</pubDate>
  </item>
  <item>
    <title>Guid only</title>
    <guid isPermaLink="true">https://rss.example/guid</guid>
    <pubDate>Thu, 09 Oct 2026 08:00:00 GMT</pubDate>
  </item>
  <item><title>No link</title></item>
</channel></rss>`;

describe("parseFeed", () => {
  it("reads Atom entries, preferring the alternate link and resolving it", () => {
    expect(parseFeed(atom, "https://blog.example/feed.atom")).toEqual([
      { title: "Tom & Jerry's <guide>", url: "https://blog.example/a/", date: "2026-10-06T00:00:00.000Z" },
      { title: "No date", url: "https://blog.example/b/", date: null },
    ]);
  });

  it("reads RSS items, unwraps CDATA, falls back to a permalink guid and drops linkless items", () => {
    expect(parseFeed(rss)).toEqual([
      { title: "Hello world", url: "https://rss.example/hello", date: "2026-10-10T08:00:00.000Z" },
      { title: "Guid only", url: "https://rss.example/guid", date: "2026-10-09T08:00:00.000Z" },
    ]);
  });
});

describe("collectFeed", () => {
  const sources = [
    { name: "Atom Blog", url: "https://blog.example", feed: "https://blog.example/feed.atom" },
    { name: "RSS Blog", url: "https://rss.example", feed: "https://rss.example/rss" },
    { name: "Dead Blog", url: "https://dead.example", feed: "https://dead.example/rss" },
  ];
  const fetchText = async (url: string) => {
    if (url.startsWith("https://dead.example")) throw new Error("HTTP 500");
    return url.startsWith("https://blog.example") ? atom : rss;
  };

  it("merges feeds newest first, reports failures, and never throws", async () => {
    const result = await collectFeed(sources, { perFeed: 10, maxItems: 10, now: new Date("2026-10-11T00:00:00Z") }, fetchText);
    expect(result.generatedAt).toBe("2026-10-11T00:00:00.000Z");
    expect(result.items.map(item => [item.title, item.source])).toEqual([
      ["Hello world", "RSS Blog"],
      ["Guid only", "RSS Blog"],
      ["Tom & Jerry's <guide>", "Atom Blog"],
      ["No date", "Atom Blog"],
    ]);
    expect(result.sources.map(source => [source.name, source.ok, source.error])).toEqual([
      ["Atom Blog", true, undefined],
      ["RSS Blog", true, undefined],
      ["Dead Blog", false, "HTTP 500"],
    ]);
  });

  it("caps entries per feed and overall, and drops future-dated entries", async () => {
    const result = await collectFeed(sources.slice(0, 2), { perFeed: 1, maxItems: 1, now: new Date("2026-10-09T12:00:00Z") }, fetchText);
    // Hello world (Oct 10) is in the future relative to now; Guid only was cut by perFeed: 1.
    expect(result.items.map(item => item.title)).toEqual(["Tom & Jerry's <guide>"]);
  });

  it("removes duplicate URLs across feeds", async () => {
    const result = await collectFeed(
      [sources[1]!, { ...sources[1]!, name: "Mirror" }],
      { perFeed: 10, maxItems: 10, now: new Date("2026-10-11T00:00:00Z") },
      fetchText,
    );
    expect(result.items).toHaveLength(2);
  });
});

describe("sameFeedContent", () => {
  const base = {
    generatedAt: "2026-10-10T00:00:00.000Z",
    sources: [{ name: "A", url: "https://a.example", feed: "https://a.example/rss", ok: true }],
    items: [{ title: "Post", url: "https://a.example/post", date: "2026-10-09T00:00:00.000Z", source: "A", sourceUrl: "https://a.example" }],
  };

  it("ignores generatedAt so an unchanged refresh doesn't rewrite the snapshot", () => {
    expect(sameFeedContent(base, { ...base, generatedAt: "2026-10-11T00:00:00.000Z" })).toBe(true);
  });

  it("detects new items and source failures", () => {
    expect(sameFeedContent(base, { ...base, items: [] })).toBe(false);
    expect(sameFeedContent(base, { ...base, sources: [{ ...base.sources[0]!, ok: false, error: "HTTP 500" }] })).toBe(false);
  });
});
