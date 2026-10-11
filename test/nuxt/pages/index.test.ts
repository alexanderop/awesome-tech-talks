import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import IndexPage from "~/pages/index.vue";
import { makeArticle } from "./_article-helpers";
import { makeTalk } from "./_talk-helpers";

const { talks, articles } = vi.hoisted(() => {
  const { ref } = require("vue");
  return { talks: ref([]), articles: ref([]) };
});

mockNuxtImport("useAllTalks", () => () => ({ data: talks }));
mockNuxtImport("useAllArticles", () => () => ({ data: articles }));

describe("index page", () => {
  beforeEach(() => {
    talks.value = [
      makeTalk({ path: "/talks/featured-1", title: "Featured One", featured: true }),
      makeTalk({ path: "/talks/recent-1", title: "Recent One" }),
      makeTalk({ path: "/talks/recent-2", title: "Recent Two" }),
    ];
    articles.value = [makeArticle({ path: "/articles/a-1", title: "Article One", tags: ["mcp"] })];
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
    expect(hrefs).toEqual(["/talks", "/articles", "/channels", "/people"]);
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
});
