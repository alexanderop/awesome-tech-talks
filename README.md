# Awesome Tech Talks

A curated collection of software engineering conference talks (from YouTube) and blog posts, summarized, tagged and linked. Built with Nuxt 4 and Nuxt Content 3, on the NuxtPaper port of the AstroPaper theme.

[Live site](https://alexanderop.github.io/awesome-tech-talks/)

## Add talks

Talks live in `content/talks/*.md`, validated by the `talks` schema in `content.config.ts`. Claude Code adds them through two project skills:

- `/add-talk <youtube-url>` adds one talk: transcript, summary, takeaways, tags, level, resources.
- `/add-talk` (no argument) discovers new talks from `data/sources.json`, picks up to five, and records rejected ones in `data/skipped.json`.
- `/add-article <url>` adds a blog post you like; `/add-article` (no argument) checks the followed blogs' feeds for posts from the last 30 days.

The scripts behind them need [uv](https://docs.astral.sh/uv/) (`uvx` runs the latest yt-dlp):

```sh
pnpm talks:discover                 # JSON list of new candidates
pnpm articles:discover              # new posts from followed blogs
pnpm articles:fetch <url>           # writes .cache/articles/<slug>/article.md + meta.json
pnpm talks:add-source …             # follow a talk's channel/speakers or an article's blog/authors
pnpm talks:transcript <url-or-id>   # writes .cache/talks/<id>/transcript.md + meta.json
```

To run discovery daily, create a scheduled cloud routine with `/schedule` and the prompt `Run the add-talk skill and then the add-article skill, both with no argument`.

To follow more conferences or speakers, edit `data/sources.json`. Channel IDs start with `UC`. YouTube's RSS feeds return 404, so discovery lists channels with yt-dlp instead.

## Run the site

Use Node.js 22 or newer and the pnpm version in `package.json`.

```sh
pnpm install
pnpm generate
pnpm dev
```

Open the local address printed by Nuxt. `pnpm generate` also creates the Pagefind index used during development. Regenerate after content changes when you need updated search results. 

## Publish a static site

```sh
pnpm build
```

`build` runs the static generation and search-index pipeline.

Deploy `.output/public` to a static host. For a GitHub Pages project path, generate with its base URL.

```sh
NUXT_APP_BASE_URL=/awesome-tech-talks/ pnpm generate
```

The existing GitHub Actions workflow builds and deploys `main` to GitHub Pages.

## Customize the site

Edit `shared/utils/site.ts` to set site metadata, homepage text, feature flags, and social links. Set the site URL to the full public address, including a project subpath when applicable. Keep the build's base URL consistent with that address.

The appearance lives in `app/assets/css`. Components use outline icons and Tailwind CSS 4 classes. Nuxt Content renders Markdown through the Vue prose components in `app/components/content`.

Pages: `/` (latest talks and articles, counts, tags), `/talks` (filters: tag, level, conference, speaker, channel), `/articles` (filters: tag, level, author) and `/articles/<slug>`, `/channels`, `/people` (speakers and article authors; `/speakers` redirects), `/tags`, `/about`, `/search`. `rss.xml` and `sitemap.xml` list talks and articles.

## Verify changes

```sh
pnpm exec playwright install chromium
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm generate
pnpm test:browser:prebuilt
```

The browser suite exercises the generated static site. Existing Nuxt component tests use a simulated DOM; they do not establish visual parity or browser focus behavior. The separate parity workflow compares the same upstream content and configuration through both implementations. See [the comparison method and results](docs/parity/README.md).

## Credits

MIT licensed. AstroPaper was created by [Sat Naing](https://satna.ing). Its original copyright notice remains in [LICENSE](LICENSE). The bundled Google Sans Code fonts retain their [SIL Open Font License](app/assets/fonts/OFL.txt). The port's upstream comparison is pinned to commit `35cfa7fbe0b897306d27670d3819e55d5205f3dd`.
