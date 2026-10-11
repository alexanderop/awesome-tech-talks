import { queryCollection } from "@nuxt/content/server";
import { joinURL } from "ufo";

export default defineEventHandler(async event => {
  const [talks, articles] = await Promise.all([
    queryCollection(event, "talks").select("path", "title", "description", "addedAt").all(),
    queryCollection(event, "articles").select("path", "title", "description", "addedAt").all(),
  ]);

  const items = sortByAddedAt([...talks, ...articles])
    .map(entry => {
      const url = escapeXml(joinURL(SITE.url, entry.path));
      return `    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <description>${escapeXml(entry.description)}</description>
      <pubDate>${new Date(entry.addedAt).toUTCString()}</pubDate>
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE.title)}</title>
    <link>${escapeXml(SITE.url)}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>${SITE.lang}</language>
${items}
  </channel>
</rss>`;

  setResponseHeader(event, "content-type", "application/rss+xml");
  return rss;
});
