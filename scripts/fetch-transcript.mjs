#!/usr/bin/env node
// Downloads a YouTube video's metadata and English captions with yt-dlp and
// writes a clean, timestamped transcript to .cache/talks/<id>/.
//
// Usage: node scripts/fetch-transcript.mjs <youtube-url-or-id>
//
// Requires `uvx` (uv). yt-dlp runs via uvx with curl-cffi so it can
// impersonate Chrome; without impersonation YouTube answers caption
// requests with HTTP 429.
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const input = process.argv[2];
const id = input?.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/)?.[1] ?? input;
if (!id || !/^[\w-]{11}$/.test(id)) {
  console.error("Usage: node scripts/fetch-transcript.mjs <youtube-url-or-id>");
  process.exit(1);
}

const dir = resolve(".cache/talks", id);
mkdirSync(dir, { recursive: true });

const ytDlp = (...args) => execFileSync("uvx", [
  "--from", "yt-dlp[default,curl-cffi]", "yt-dlp",
  "--skip-download", "--impersonate", "chrome", "--no-warnings",
  "-o", resolve(dir, "video.%(ext)s"),
  ...args,
  `https://www.youtube.com/watch?v=${id}`,
], { stdio: ["ignore", "ignore", "inherit"] });

ytDlp("--write-info-json");
const info = JSON.parse(readFileSync(resolve(dir, "video.info.json"), "utf8"));

// Creator-uploaded English captions beat auto captions. Among auto captions
// only the "-orig" track is a real transcript; plain "en" on a non-English
// video is a machine translation and YouTube rate-limits those with HTTP 429.
const manual = Object.keys(info.subtitles ?? {}).find(lang => /^en(-|$)/.test(lang));
const autoLangs = Object.keys(info.automatic_captions ?? {});
const auto = autoLangs.find(lang => lang === `${info.language}-orig`) ?? autoLangs.find(lang => lang === "en-orig");
const track = manual ?? auto;
if (track) ytDlp(manual ? "--write-subs" : "--write-auto-subs", "--sub-langs", track, "--sub-format", "vtt");
const preferred = track && readdirSync(dir).find(file => file === `video.${track}.vtt`);

const transcript = preferred ? vttToText(readFileSync(resolve(dir, preferred), "utf8")) : "";
writeFileSync(resolve(dir, "transcript.md"), transcript);

const meta = {
  youtubeId: id,
  url: `https://www.youtube.com/watch?v=${id}`,
  title: info.title,
  channel: info.channel,
  channelId: info.channel_id,
  publishedAt: `${info.upload_date.slice(0, 4)}-${info.upload_date.slice(4, 6)}-${info.upload_date.slice(6, 8)}`,
  durationMin: Math.round(info.duration / 60),
  description: info.description,
  chapters: (info.chapters ?? []).map(chapter => ({ start: formatTime(chapter.start_time), title: chapter.title })),
  tags: info.tags ?? [],
  captions: preferred ?? null,
  transcriptWords: transcript.split(/\s+/).filter(Boolean).length,
};
writeFileSync(resolve(dir, "meta.json"), `${JSON.stringify(meta, null, 2)}\n`);

console.log(JSON.stringify({ dir, title: meta.title, channel: meta.channel, durationMin: meta.durationMin, captions: meta.captions, transcriptWords: meta.transcriptWords }));
if (!preferred) {
  console.error("No English captions found. Write the entry from meta.json description and chapters only.");
  process.exit(2);
}

// YouTube auto captions repeat each line across rolling cues. Keep only the
// lines that introduce new words (they carry inline <c> word timings), or
// every distinct line for manual captions, and emit a timestamp per minute.
function vttToText(vtt) {
  const cues = vtt.split(/\n\n+/).flatMap(block => {
    const lines = block.split("\n");
    const timing = lines.findIndex(line => line.includes("-->"));
    if (timing === -1) return [];
    return [{ start: parseTime(lines[timing].split(" ")[0]), lines: lines.slice(timing + 1) }];
  });
  const rolling = cues.some(cue => cue.lines.some(line => line.includes("<c>")));
  const out = [];
  let previous = "";
  let nextStamp = 0;
  for (const cue of cues) {
    for (const raw of cue.lines) {
      if (rolling && !raw.includes("<c>")) continue;
      const text = raw.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").trim();
      if (!text || text === previous) continue;
      previous = text;
      if (cue.start >= nextStamp) {
        out.push(`\n[${formatTime(cue.start)}] `);
        nextStamp = Math.floor(cue.start / 60) * 60 + 60;
      }
      out.push(`${text} `);
    }
  }
  return `${out.join("").trim()}\n`;
}

function parseTime(stamp) {
  const [h, m, s] = stamp.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}

function formatTime(seconds) {
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return h ? `${h}:${m}:${s}` : `${m}:${s}`;
}
