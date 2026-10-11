---
title: "About"
description: "What Awesome Tech Talks is and how talks get added."
---

Awesome Tech Talks is a small, curated list of software engineering conference talks from YouTube. Each talk has a short summary, the main takeaways, tags, a level, and a link to the original video, so you can decide what to watch before you press play.

The summaries are written with AI assistance from the talk transcripts. I read and edit them, but treat them as a guide to the talk, not a replacement for it. Watch the video for the full argument.

The site is curated by [Alexander Opalic](https://alexop.dev).

## How talks get added

New talks and articles come from the YouTube channels, blogs and people listed in [`data/sources.json`](https://github.com/alexanderop/awesome-tech-talks/blob/main/data/sources.json). You can see them on the [Channels](/channels) and [People](/people) pages. A discovery script lists recent long talks from those channels, a talk is picked and summarized, and the result is added as a Markdown file in `content/talks`. Articles work the same way: followed blogs' feeds are checked for new posts, which land in `content/articles`.

Following a new channel or speaker is a one-line change to that file. The source code is on [GitHub](https://github.com/alexanderop/awesome-tech-talks).
