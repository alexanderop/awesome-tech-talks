import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import IndexPage from "~/pages/index.vue";
import { makeArticle } from "./_article-helpers";
import { makeFeed, makeFeedItem } from "./_feed-helpers";
import { makeTalk } from "./_talk-helpers";

const { talks, articles, tweets, feed } = vi.hoisted(() => {
  const { ref } = require("vue");
  return { talks: ref([]), articles: ref([]), tweets: ref([]), feed: ref(undefined) };
});

mockNuxtImport("useAllTalks", () => () => ({ data: talks }));
mockNuxtImport("useAllArticles", () => () => ({ data: articles }));
mockNuxtImport("useAllTweets", () => () => ({ data: tweets }));
mockNuxtImport("useFeed", () => () => ({ data: feed }));

describe("index page", () => {
  beforeEach(() => {
    talks.value = [
      makeTalk({ path: "/talks/featured-1", title: "Featured One", featured: true }),
      makeTalk({ path: "/talks/recent-1", title: "Recent One" }),
      makeTalk({ path: "/talks/recent-2", title: "Recent Two" }),
    ];
    articles.value = [makeArticle({ path: "/articles/a-1", title: "Article One", tags: ["mcp"] })];
    feed.value = makeFeed({
      items: Array.from({ length: 7 }, (_, i) =>
        makeFeedItem({ title: `Feed post ${i}`, url: `https://blog.example.com/${i}`, date: `2026-10-${String(11 - i).padStart(2, "0")}T08:00:00.000Z` })
      ),
    });
  });

  it("renders the hero intro and an RSS link", async () => {
    const wrapper = await mountSuspended(IndexPage);
    expect(wrapper.text()).toContain("Awesome Tech Talks");
    expect(wrapper.find("a[aria-label='RSS Feed']").exists()).toBe(true);
  });

  it("renders talk, article, channel and people counts linking to their pages", async () => {
    const wrapper = await mountSuspended(IndexPage);
    const stats = wrapper.find("#stats");
    expect(stats.text()).toContain("3 talks");
    expect(stats.text()).toContain("1 article");
    expect(stats.text()).toContain("channels");
    expect(stats.text()).toContain("people");
    const hrefs = stats.findAll("a").map(a => a.attributes("href"));
    expect(hrefs).toEqual(["/talks", "/articles", "/tweets", "/channels", "/people"]);
  });

  it("pluralizes the article count", async () => {
    articles.value = [makeArticle({ path: "/articles/a" }), makeArticle({ path: "/articles/b" })];
    const wrapper = await mountSuspended(IndexPage);
    expect(wrapper.find("#stats").text()).toContain("2 articles");
  });

  it("renders tag pills that filter the list where the tag is used most", async () => {
    const wrapper = await mountSuspended(IndexPage);
    const hrefs = wrapper.findAll("#browse-by-tag a").map(a => a.attributes("href"));
    expect(hrefs).toContain("/talks?tag=architecture");
    expect(hrefs).toContain("/articles?tag=mcp");
  });

  it("renders the latest articles, at most five, below the latest talks", async () => {
    articles.value = Array.from({ length: 7 }, (_, i) => makeArticle({ path: `/articles/a-${i}`, title: `Article ${i}` }));
    const wrapper = await mountSuspended(IndexPage);
    expect(wrapper.findAll("#latest-articles h3")).toHaveLength(5);
    const html = wrapper.html();
    expect(html.indexOf('id="latest-talks"')).toBeLessThan(html.indexOf('id="latest-articles"'));
    const links = wrapper.findAll("#latest-articles a").map(a => a.attributes("href"));
    expect(links).toContain("/articles");
  });

  it("hides the Latest articles section when there are no articles", async () => {
    articles.value = [];
    const wrapper = await mountSuspended(IndexPage);
    expect(wrapper.find("#latest-articles").exists()).toBe(false);
    expect(wrapper.find("#stats").text()).toContain("0 articles");
  });

  it("renders featured talks under the Featured section", async () => {
    const wrapper = await mountSuspended(IndexPage);
    const featured = wrapper.find("#featured");
    expect(featured.exists()).toBe(true);
    expect(featured.text()).toContain("Featured One");
    expect(featured.text()).not.toContain("Recent One");
  });

  it("renders the latest talks, at most six", async () => {
    talks.value = Array.from({ length: 8 }, (_, i) => makeTalk({ path: `/talks/t-${i}`, title: `Talk ${i}` }));
    const wrapper = await mountSuspended(IndexPage);
    expect(wrapper.findAll("#latest-talks h3")).toHaveLength(6);
  });

  it("hides the Featured section when there are no featured talks", async () => {
    talks.value = [makeTalk({ path: "/talks/r", title: "Only Recent" })];
    const wrapper = await mountSuspended(IndexPage);
    expect(wrapper.find("#featured").exists()).toBe(false);
    expect(wrapper.find("#latest-talks").text()).toContain("Only Recent");
  });

  it("links to the all talks page", async () => {
    const wrapper = await mountSuspended(IndexPage);
    const links = wrapper.findAll("a").map(a => a.attributes("href"));
    expect(links).toContain("/talks");
  });

  it("renders the five latest feed posts below the latest articles, linking to the full feed", async () => {
    const wrapper = await mountSuspended(IndexPage);
    const section = wrapper.find("#from-the-feed");
    expect(section.find("h2").text()).toBe("From the feed");
    const posts = section.findAll("li");
    expect(posts).toHaveLength(5);
    expect(posts[0]!.text()).toContain("Feed post 0");
    expect(posts[0]!.text()).toContain("Example Blog");
    expect(posts[0]!.text()).toContain("11 Oct");
    expect(posts[0]!.find("a").attributes("href")).toBe("https://blog.example.com/0");
    expect(posts[0]!.find("a").attributes("target")).toBe("_blank");
    expect(section.text()).not.toContain("Feed post 5");
    expect(section.find("a[href='/feed']").text()).toContain("Full feed");
    const html = wrapper.html();
    expect(html.indexOf('id="latest-articles"')).toBeLessThan(html.indexOf('id="from-the-feed"'));
  });

  it("hides the feed section when the feed has no posts", async () => {
    feed.value = makeFeed({ items: [] });
    expect((await mountSuspended(IndexPage)).find("#from-the-feed").exists()).toBe(false);
    feed.value = undefined;
    expect((await mountSuspended(IndexPage)).find("#from-the-feed").exists()).toBe(false);
  });
});
