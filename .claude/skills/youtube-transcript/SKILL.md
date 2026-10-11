---
name: youtube-transcript
description: Fetch the transcript and metadata of a YouTube video. Use when you need what a talk or video actually says (to summarize it, extract takeaways, find mentioned links) or when the user pastes a YouTube URL and asks about its content.
---

# YouTube transcript

Run:

```sh
pnpm talks:transcript <youtube-url-or-id>
```

It writes three files to `.cache/talks/<id>/` (gitignored) and prints a JSON line with `dir`, `title`, `channel`, `durationMin`, `captions`, `transcriptWords`:

| File | Contents |
|---|---|
| `transcript.md` | Clean transcript, one `[mm:ss]` marker per minute |
| `meta.json` | `title`, `channel`, `publishedAt`, `durationMin`, `description`, `chapters`, `tags` |
| `video.info.json` | Raw yt-dlp metadata, only if you need more fields |

Read `transcript.md` with the Read tool. A 50-minute talk is about 7k words, so read it whole; don't grep it.

## Requirements

`uvx` (from uv). If missing: `curl -LsSf https://astral.sh/uv/install.sh | sh`, then add `~/.local/bin` to `PATH`. The script runs the latest yt-dlp with `curl-cffi` through uvx; nothing else to install.

## Exit codes

- `0`: transcript written.
- `2`: the video has no usable captions. `meta.json` still exists. Work from its `description` and `chapters`, and say in your output that no transcript was available.
- `1`: yt-dlp failed. Read the stderr line.

## Why it is built this way

These were learned the hard way. Don't undo them.

- **Chrome impersonation (`--impersonate chrome`, `curl-cffi`)**: without it YouTube answers caption downloads with HTTP 429.
- **Two passes (metadata first, then exactly one caption track)**: the plain `en` auto-caption track on a video is a machine translation, and YouTube rate-limits those with 429. The script picks creator-uploaded English captions first, then `<video language>-orig`, then `en-orig`.
- **The `-orig` track must match `info.language`**: picking the first `*-orig` key returned Arabic for an English talk.
- **Rolling auto captions repeat every line twice**: the parser keeps only lines with inline `<c>` word timings.

## Transcript quality

Auto captions misspell names and terms ("Mario Plaster" for Mario Klaver, "birth" for berth). Take names from the video title or `meta.json`, never from the transcript.
