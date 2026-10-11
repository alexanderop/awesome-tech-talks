#!/usr/bin/env node
// Registers where a talk or article came from in data/sources.json so
// discovery follows it. Idempotent: existing entries are left alone.
//
// Usage:
//   node scripts/add-source.mjs <youtube-id> [speaker ...]
//     Adds the talk's YouTube channel and the speakers.
//     Run `pnpm talks:transcript <id>` first; the channel comes from its meta.json.
//   node scripts/add-source.mjs --article <cache-slug> [author ...]
//     Adds the article's blog (by feed URL) and the authors.
//     Run `pnpm articles:fetch <url>` first; the blog comes from its meta.json.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const isArticle = args[0] === "--article";
const [key, ...people] = isArticle ? args.slice(1) : args;
if (!key) {
  console.error("Usage: node scripts/add-source.mjs <youtube-id> [speaker ...]\n       node scripts/add-source.mjs --article <cache-slug> [author ...]");
  process.exit(1);
}

const sources = JSON.parse(readFileSync("data/sources.json", "utf8"));
sources.blogs ??= [];
sources.authors ??= [];
const result = {};

if (isArticle) {
  const meta = JSON.parse(readFileSync(resolve(".cache/articles", key, "meta.json"), "utf8"));
  const feed = meta.feeds.find(url => url.includes("atom")) ?? meta.feeds[0];
  const known = sources.blogs.some(blog => blog.url === meta.siteUrl || (feed && blog.feed === feed));
  if (!feed) result.blog = "no feed found, not followed";
  else if (known) result.blog = "exists";
  else {
    sources.blogs.push({ name: meta.site, url: meta.siteUrl, feed });
    result.blog = "added";
  }
  result.blogName = meta.site;
  Object.assign(result, addPeople(sources.authors, people, "authors"));
} else {
  const meta = JSON.parse(readFileSync(resolve(".cache/talks", key, "meta.json"), "utf8"));
  if (sources.channels.some(channel => channel.id === meta.channelId)) result.channel = "exists";
  else {
    sources.channels.push({ name: meta.channel, id: meta.channelId });
    result.channel = "added";
  }
  result.channelName = meta.channel;
  Object.assign(result, addPeople(sources.speakers, people, "speakers"));
}

sources.channels.sort((a, b) => a.name.localeCompare(b.name));
sources.blogs.sort((a, b) => a.name.localeCompare(b.name));
sources.speakers.sort((a, b) => a.localeCompare(b));
sources.authors.sort((a, b) => a.localeCompare(b));
writeFileSync("data/sources.json", `${JSON.stringify(sources, null, 2)}\n`);
console.log(JSON.stringify(result));

function addPeople(list, names, label) {
  const added = [];
  const existing = [];
  for (const name of names) {
    if (list.some(entry => entry.toLowerCase() === name.toLowerCase())) existing.push(name);
    else {
      list.push(name);
      added.push(name);
    }
  }
  return { [`${label}Added`]: added, [`${label}Existing`]: existing };
}
