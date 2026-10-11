#!/usr/bin/env node
// Downloads a blog post and writes its metadata and readable text to
// .cache/articles/<slug>/ for summarizing.
//
// Usage: node scripts/fetch-article.mjs <url>
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const url = process.argv[2];
if (!url || !/^https?:\/\//.test(url)) {
  console.error("Usage: node scripts/fetch-article.mjs <url>");
  process.exit(1);
}

const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (compatible; awesome-tech-talks)" } });
if (!response.ok) {
  console.error(`HTTP ${response.status} for ${url}`);
  process.exit(1);
}
const html = await response.text();
const finalUrl = response.url;

const meta = (name) => html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=(["'])(.*?)\\1`, "i"))?.[2]
  ?? html.match(new RegExp(`<meta[^>]+content=(["'])(.*?)\\1[^>]+(?:property|name)=["']${name}["']`, "i"))?.[2];
const feeds = [...html.matchAll(/<link[^>]+rel=["']alternate["'][^>]*>/gi)]
  .map(([tag]) => ({ type: tag.match(/type=["']([^"']+)/)?.[1], href: tag.match(/href=["']([^"']+)/)?.[1] }))
  .filter(feed => feed.href && /rss|atom/.test(feed.type ?? ""))
  .map(feed => new URL(feed.href, finalUrl).href);
const dateFromUrl = finalUrl.match(/\/(20\d{2})\/(\d{1,2})\/(\d{1,2})\//);
const published = meta("article:published_time")
  ?? html.match(/<time[^>]+datetime=["']([^"']+)/i)?.[1]
  ?? (dateFromUrl ? `${dateFromUrl[1]}-${dateFromUrl[2].padStart(2, "0")}-${dateFromUrl[3].padStart(2, "0")}` : null);

const text = htmlToText(html.match(/<article[\s\S]*?<\/article>/i)?.[0] ?? html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html);
const words = text.split(/\s+/).filter(Boolean).length;

const slug = new URL(finalUrl).pathname.split("/").findLast(Boolean)?.replace(/\.\w+$/, "") || "index";
const dir = resolve(".cache/articles", slug);
mkdirSync(dir, { recursive: true });
const info = {
  url: finalUrl,
  title: decode(meta("og:title") ?? html.match(/<title>([^<]*)/i)?.[1] ?? ""),
  description: decode(meta("description") ?? meta("og:description") ?? ""),
  site: decode(meta("og:site_name") ?? new URL(finalUrl).hostname),
  siteUrl: new URL(finalUrl).origin,
  author: decode(meta("author") ?? meta("article:author") ?? ""),
  publishedAt: published?.slice(0, 10) ?? null,
  feeds,
  words,
  readingMin: Math.max(1, Math.round(words / 230)),
};
writeFileSync(resolve(dir, "meta.json"), `${JSON.stringify(info, null, 2)}\n`);
writeFileSync(resolve(dir, "article.md"), `${text}\n`);
console.log(JSON.stringify({ dir, ...info }));

function htmlToText(fragment) {
  // Pull <pre> blocks out first so whitespace cleanup keeps code indentation.
  const blocks = [];
  const prose = fragment
    .replace(/<(head|script|style|nav|footer|header|svg|form)[\s\S]*?<\/\1>/gi, "")
    .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, code) => `\n@@PRE${blocks.push(decode(code.replace(/<[^>]+>/g, "")).replace(/\n+$/, "")) - 1}@@\n`)
    .replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, label) => `[${label.replace(/<[^>]+>/g, "")}](${new URL(href, url).href})`)
    .replace(/<h([1-6])[^>]*>/gi, (_, level) => `\n\n${"#".repeat(Number(level))} `)
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<\/(p|div|h[1-6]|ul|ol|blockquote|section)>|<br\s*\/?>/gi, "\n\n")
    .replace(/<[^>]+>/g, "");
  return decode(prose)
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/^- *$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .replace(/@@PRE(\d+)@@/g, (_, index) => `\`\`\`\n${blocks[Number(index)]}\n\`\`\``);
}

function decode(value) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&quot;/g, "\"").replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&copy;/g, "©").replace(/&amp;/g, "&");
}
