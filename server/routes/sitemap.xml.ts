import { queryCollection } from "@nuxt/content/server";
import { joinURL } from "ufo";

export default defineEventHandler(async event => {
  const [talks, articles, tweets] = await Promise.all([
    queryCollection(event, "talks").select("path", "addedAt").all(),
    queryCollection(event, "articles").select("path", "addedAt").all(),
    queryCollection(event, "tweets").select("path", "addedAt").all(),
  ]);
  const urls = [
    { path: "/" },
    { path: "/talks" },
    { path: "/articles" },
    { path: "/tweets" },
    { path: "/feed" },
    { path: "/channels" },
    { path: "/people" },
    { path: "/tags" },
    { path: "/about" },
    ...(FEATURES.search ? [{ path: "/search" }] : []),
    ...[...talks, ...articles, ...tweets].map(entry => ({ path: entry.path, lastmod: new Date(entry.addedAt).toISOString() })),
  ];

  const body = urls
    .map(
      url => `  <url>
    <loc>${escapeXml(joinURL(SITE.url, url.path))}</loc>${
      "lastmod" in url ? `\n    <lastmod>${url.lastmod}</lastmod>` : ""
    }
  </url>`
    )
    .join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;

  setResponseHeader(event, "content-type", "application/xml");
  return sitemap;
});
