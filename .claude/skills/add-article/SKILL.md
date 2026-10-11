---
name: add-article
description: Add curated blog posts and articles to the site. With a URL, add that article. With no argument (or "new"), discover new posts from the blogs in data/sources.json, pick the best ones, and add them. Use for "add this article/blog post", "add-article <url>", "find new articles", or the scheduled daily run.
---

# Add article

Next to talks, the site curates blog posts the owner really likes. Each article is one Markdown file in `content/articles/`. The bar is the same as for talks: worth a senior developer's reading time, with substance, not news or announcements.

## Mode A: one URL

1. Fetch it: `pnpm articles:fetch <url>`. This writes `.cache/articles/<slug>/article.md` (readable text, code blocks kept) and `meta.json` (`title`, `description`, `site`, `siteUrl`, `author`, `publishedAt`, `feeds`, `readingMin`). Read `article.md` whole. The first and last lines are site navigation and footer; ignore them.
2. Write the article file (see "Article file" below).
3. Follow the blog and the authors: `pnpm talks:add-source --article <cache-slug> "<Author>"`. It adds the blog's feed to `data/sources.json` only if it isn't there yet, and each author only if the name isn't there yet. If it reports "no feed found", say so in your report.
4. Verify (see "Verify").

## Mode B: discover (no argument, or "new")

1. Run `pnpm articles:discover > .cache/article-candidates.json`. It lists posts from the last 30 days from followed blogs that are not yet in `content/articles/` or `data/skipped.json`.
2. Triage by title: skip release notes, link roundups, personal and off-topic posts, and short announcements.
3. Pick **at most 3** per run. For each pick, run Mode A steps 1–3. If the full text turns out thin, skip it instead.
4. Append every post you judged and skipped to `data/skipped.json`: `{ "url": "…", "title": "…", "reason": "…" }`. Leave posts you didn't judge out of the file.
5. Verify once for all files.

## Article file

Path: `content/articles/<slug>.md`, the kebab-cased title, max ~6 words.

Copy the shape of `content/articles/what-is-codemode.md` exactly. Frontmatter is validated by the `articles` schema in `content.config.ts`:

| Field | Source |
|---|---|
| `title` | The post's own title |
| `description` | 1–2 sentences: who, what claim or idea. Under 220 characters. |
| `url`, `siteUrl`, `publishedAt`, `readingMin` | `meta.json` |
| `site` | `meta.json` `site` (the blog's name) |
| `authors` | Byline or `meta.json` `author`. Check against the page; never guess. |
| `addedAt` | Today, `YYYY-MM-DD` |
| `level` | `beginner`, `intermediate` or `advanced`, same meaning as for talks |
| `tags` | 3–6 lowercase kebab-case tags. Reuse existing tags first: `grep -h -A8 '^tags:' content/talks/*.md content/articles/*.md` |
| `resources` | Links the post itself references that a reader would follow up on. Use the target page's real `<title>` as the label. Check each with `curl -sL -o /dev/null -w '%{http_code}' -A 'Mozilla/5.0' <url>` and drop anything that isn't 200. |

Body sections, in order:

1. `## Summary`: 2–3 short paragraphs. The context, the argument, the evidence or examples.
2. `## Key takeaways`: 5–8 bullets. Each one starts with a bold one-line claim, followed by one sentence of substance.
3. `## Notable quotes` (optional): 1–3 short verbatim quotes as `>` blockquotes, copied exactly from `article.md`.

Writing rules: plain, direct sentences. No hype words. Represent the author's position faithfully, including what they say is unsolved.

## Verify

```sh
pnpm lint && pnpm typecheck && pnpm generate
```

Then check that `.output/public/articles/<slug>/index.html` exists. These commands rebuild `.nuxt`, so restart a running dev server afterwards.

## Finish

Same as the add-talk skill: report the path and local URL interactively. In a scheduled run, commit on the same `talks/<YYYY-MM-DD>` branch and list articles in the same PR.
