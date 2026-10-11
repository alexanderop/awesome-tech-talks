#!/usr/bin/env node
// Lists recent posts from the blogs in data/sources.json that are not yet in
// content/articles and not in data/skipped.json. Prints JSON to stdout.
//
// Usage: node scripts/discover-articles.mjs [max-age-days=30]
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseFeed } from "../shared/utils/feed.ts";

const maxAgeDays = Number(process.argv[2] ?? 30);
const sources = JSON.parse(readFileSync("data/sources.json", "utf8"));
const { skipped } = JSON.parse(readFileSync("data/skipped.json", "utf8"));

const normalizeUrl = url => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "");
const known = new Set(skipped.filter(entry => entry.url).map(entry => normalizeUrl(entry.url)));
for (const entry of readdirSync(resolve("content/articles"), { recursive: true, withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
  const url = readFileSync(resolve(entry.parentPath, entry.name), "utf8").match(/^url:\s*["']?(\S+?)["']?$/m)?.[1];
  if (url) known.add(normalizeUrl(url));
}

const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
const feeds = await Promise.all((sources.blogs ?? []).map(async blog => {
  try {
    const response = await fetch(blog.feed, { headers: { "user-agent": "Mozilla/5.0 (compatible; awesome-tech-talks)" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return { blog, xml: await response.text() };
  } catch (error) {
    console.error(`Failed to fetch ${blog.feed}: ${error.message}`);
    return { blog, xml: "" };
  }
}));

const candidates = [];
for (const { blog, xml } of feeds) {
  for (const entry of parseFeed(xml, blog.feed)) {
    if (entry.date && Date.parse(entry.date) < cutoff) continue;
    if (known.has(normalizeUrl(entry.url))) continue;
    known.add(normalizeUrl(entry.url));
    candidates.push({ url: entry.url, title: entry.title, blog: blog.name, publishedAt: entry.date?.slice(0, 10) ?? null });
  }
}

console.log(JSON.stringify(candidates, null, 2));
