#!/usr/bin/env node
// Lists talk candidates from data/sources.json that are not yet in
// content/talks and not in data/skipped.json. Prints JSON to stdout.
//
// Usage: node scripts/discover-talks.mjs
//
// YouTube's channel RSS feeds (feeds/videos.xml) return 404, so this uses
// `yt-dlp --flat-playlist`, which lists newest uploads with durations.
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const sources = JSON.parse(readFileSync("data/sources.json", "utf8"));
const { skipped } = JSON.parse(readFileSync("data/skipped.json", "utf8"));

// The same talk is often uploaded by several channels, so also match on a
// normalized title prefix (titles get suffixed with "by <speaker>").
const normalize = title => title.toLowerCase().split(/\s+by\s+/)[0].replace(/[^a-z0-9]+/g, " ").trim();
const known = new Set(skipped.map(entry => entry.youtubeId));
const knownTitles = new Set(skipped.filter(entry => entry.title).map(entry => normalize(entry.title)));
for (const entry of readdirSync(resolve("content/talks"), { recursive: true, withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
  const source = readFileSync(resolve(entry.parentPath, entry.name), "utf8");
  const id = source.match(/^youtubeId:\s*["']?([\w-]{11})/m)?.[1];
  const title = source.match(/^title:\s*["']?(.+?)["']?$/m)?.[1];
  if (id) known.add(id);
  if (title) knownTitles.add(normalize(title));
}

function list(url, limit) {
  try {
    const output = execFileSync("uvx", [
      "--from", "yt-dlp[default,curl-cffi]", "yt-dlp",
      "--impersonate", "chrome", "--no-warnings", "--flat-playlist",
      "--playlist-end", String(limit),
      "--print", "%(.{id,title,duration,channel})j",
      url,
    ], { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });
    return output.split("\n").filter(Boolean).map(line => JSON.parse(line));
  } catch {
    console.error(`Failed to list ${url}`);
    return [];
  }
}

const candidates = new Map();
function add(video, source) {
  if (known.has(video.id) || candidates.has(video.id) || knownTitles.has(normalize(video.title ?? ""))) return;
  if (!video.duration || video.duration < sources.minDurationMin * 60) return;
  knownTitles.add(normalize(video.title ?? ""));
  candidates.set(video.id, {
    youtubeId: video.id,
    url: `https://www.youtube.com/watch?v=${video.id}`,
    title: video.title,
    channel: video.channel ?? source,
    durationMin: Math.round(video.duration / 60),
    source,
  });
}

for (const channel of sources.channels) {
  for (const video of list(`https://www.youtube.com/channel/${channel.id}/videos`, sources.perChannel)) add({ channel: channel.name, ...video }, channel.name);
}
for (const speaker of sources.speakers) {
  const needle = speaker.toLowerCase();
  for (const video of list(`ytsearch${sources.perSpeaker}:"${speaker}" talk`, sources.perSpeaker)) {
    if (video.title?.toLowerCase().includes(needle)) add(video, `speaker: ${speaker}`);
  }
}

console.log(JSON.stringify([...candidates.values()], null, 2));
