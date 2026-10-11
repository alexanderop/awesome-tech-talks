#!/usr/bin/env node
// Fetches every feed in data/feeds.json plus the blogs followed in
// data/sources.json and writes data/feed-snapshot.json, which the site build
// reads. Leaves the file untouched when nothing changed, so the scheduled
// workflow only commits (and deploys) when there is something new.
//
// Usage: node scripts/refresh-feed.mjs
// Prints {"changed": true|false, ...} as JSON.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { collectFeed, sameFeedContent } from "../shared/utils/feed.ts";

const SNAPSHOT = "data/feed-snapshot.json";
const config = JSON.parse(readFileSync("data/feeds.json", "utf8"));
const { blogs = [] } = JSON.parse(readFileSync("data/sources.json", "utf8"));
const followedBlogs = blogs.filter(blog => !config.feeds.some(feed => feed.feed === blog.feed));

const next = await collectFeed(
  [...config.feeds, ...followedBlogs].map(({ name, url, feed }) => ({ name, url, feed })),
  { perFeed: config.perFeed, maxItems: config.maxItems, now: new Date() },
  async url => {
    const response = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; awesome-tech-talks; +https://alexanderop.github.io/awesome-tech-talks/)" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.text();
  },
);

const previous = existsSync(SNAPSHOT) ? JSON.parse(readFileSync(SNAPSHOT, "utf8")) : null;
const changed = !previous || !sameFeedContent(previous, next);
if (changed) writeFileSync(SNAPSHOT, `${JSON.stringify(next, null, 2)}\n`);

const failed = next.sources.filter(source => !source.ok).map(source => `${source.name}: ${source.error}`);
console.log(JSON.stringify({ changed, items: next.items.length, sources: next.sources.length, failed }));
