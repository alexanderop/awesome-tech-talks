---
name: add-talk
description: Add conference talks from YouTube to the site. With a URL, add that talk. With no argument (or "new"), discover new talks from data/sources.json, pick the best ones, and add them. Use for "add this talk", "add-talk <url>", "find new talks", or the scheduled daily run.
---

# Add talk

The site is a curated overview of great software-engineering talks. Each talk is one Markdown file in `content/talks/`. Quality over volume: a talk on this site should be worth 45 minutes of a senior developer's time.

## Mode A: one URL

1. Fetch the transcript with the `youtube-transcript` skill: `pnpm talks:transcript <url>`.
2. Write the talk file (see "Talk file" below).
3. Register the channel and speakers so discovery follows them: `pnpm talks:add-source <youtube-id> "<Speaker One>" "<Speaker Two>"`. It adds the channel to `data/sources.json` only if its ID isn't there yet, and each speaker only if the name isn't there yet. It prints what it added; mention that in your report.
4. Verify (see "Verify").

## Mode B: discover (no argument, or "new")

1. Run `pnpm talks:discover > .cache/candidates.json`. It lists videos from `data/sources.json` channels and speaker searches that are at least `minDurationMin` long and not yet in `content/talks/` or `data/skipped.json`. Duplicate uploads of the same title are already filtered.
2. Triage by title and channel only (no transcripts yet). Skip:
   - non-talks: trailers, interviews, podcasts, panels, keynote intros, sponsor content, "highlights", livestream recordings, workshops longer than 2 hours
   - product pitches and vendor demos
   - near-duplicates of a talk already on the site
3. Pick **at most 5** talks per run, newest and most broadly useful first. Variety across topics beats five AI talks.
4. For each pick: run Mode A steps 1–3. If the transcript shows the talk is weak (thin content, mostly a product demo, unintelligible audio), skip it instead.
5. Append every talk you skipped, in step 2 or step 4, to `data/skipped.json`, so later runs don't reconsider it:
   ```json
   { "youtubeId": "abc123def45", "title": "…", "reason": "vendor demo" }
   ```
   Leave unpicked candidates you did not judge out of the file; a later run may pick them.
6. Verify once for all files (see "Verify").

## Talk file

Path: `content/talks/<slug>.md`. The slug is the kebab-cased core title without the speaker name, max ~6 words (`state-of-the-tech-industry-2026`).

Copy the shape of `content/talks/state-of-the-tech-industry-2026.md` exactly. Frontmatter is validated by the `talks` schema in `content.config.ts`:

| Field | Source |
|---|---|
| `title` | Video title without the "by <speaker>" suffix |
| `description` | 1–2 sentences: who, what problem, what approach. Under 220 characters. |
| `youtubeId`, `channel`, `channelId`, `durationMin`, `publishedAt` | `meta.json` |
| `addedAt` | Today, `YYYY-MM-DD` |
| `speakers` | From the title, description or the speaker's own intro. Never trust the auto-caption spelling. |
| `conference` | Conference plus edition (`Devoxx Belgium 2026`) **only if the title, description or a web page confirms it**; otherwise the channel name |
| `level` | `beginner`: newcomers can follow. `intermediate`: assumes working experience with the topic. `advanced`: deep internals or expert trade-offs. |
| `tags` | 3–6 lowercase kebab-case tags. Reuse existing tags first: `grep -h -A8 '^tags:' content/talks/*.md` |
| `resources` | Only links actually mentioned in the talk or description: repos, docs, books, articles. Check each URL with `curl -sL -o /dev/null -w '%{http_code}' -A 'Mozilla/5.0' <url>` and drop anything that isn't 200. Never invent a URL. If none, use `resources: []`. |

Body sections, in this order:

1. `## Summary`: 2–3 short paragraphs. The context, the problem, what they did.
2. `## Key takeaways`: 5–8 bullets. Each one starts with a bold one-line claim, followed by one sentence of substance. Specific beats generic: name the tool, number or pattern the speaker used.
3. `## Chapters`: 10–15 `- mm:ss Title` lines from the transcript's `[mm:ss]` markers, or from `meta.json` `chapters` when present.

Writing rules: plain, direct sentences. No hype words ("game-changing", "deep dive", "unlock"). Don't claim results the speaker says are unmeasured.

## Verify

```sh
pnpm lint && pnpm typecheck && pnpm generate
```

`pnpm generate` fails on invalid frontmatter. Fix and rerun until it passes. Then check that `.output/public/talks/<slug>/index.html` exists for each new talk.

## Finish

- Single URL, run interactively: report the file path and the local URL.
- Scheduled run: commit with `Add N talks: <short titles>`, plus `data/skipped.json`, on a branch `talks/<YYYY-MM-DD>`, and open a PR listing each talk (title, speaker, conference, one-line why) and the skipped count. If nothing was worth adding, commit only `data/skipped.json` and say so.
