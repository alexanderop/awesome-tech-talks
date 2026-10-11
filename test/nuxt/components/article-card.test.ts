import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import ArticleCard from "~/components/ArticleCard.vue";
import { makeArticle } from "../pages/_article-helpers";

const article = makeArticle({
  path: "/articles/hello-article",
  title: "Hello Article",
  authors: ["Ann Author", "Bob Writer"],
  tags: ["mcp", "Agent Harness"],
});

describe("ArticleCard", () => {
  it("has no thumbnail", async () => {
    const wrapper = await mountSuspended(ArticleCard, { props: { article } });
    expect(wrapper.find("img").exists()).toBe(false);
  });

  it("links the title to the article page", async () => {
    const wrapper = await mountSuspended(ArticleCard, { props: { article } });
    const link = wrapper.find("h2").element.closest("a");
    expect(link?.getAttribute("href")).toBe("/articles/hello-article");
  });

  it("renders authors, site, reading time, level and description", async () => {
    const wrapper = await mountSuspended(ArticleCard, { props: { article } });
    expect(wrapper.text()).toContain("Ann Author, Bob Writer");
    expect(wrapper.text()).toContain("Example Blog");
    expect(wrapper.text()).toContain("8 min read");
    expect(wrapper.text()).toContain("Intermediate");
    expect(wrapper.text()).toContain("An example article description.");
  });

  it("links each author to the author-filtered articles list", async () => {
    const wrapper = await mountSuspended(ArticleCard, { props: { article } });
    const hrefs = wrapper.findAll("a").map(a => a.attributes("href"));
    expect(hrefs).toContain("/articles?author=ann-author");
    expect(hrefs).toContain("/articles?author=bob-writer");
  });

  it("links tags to the filtered articles list", async () => {
    const wrapper = await mountSuspended(ArticleCard, { props: { article } });
    const hrefs = wrapper.findAll("ul a").map(a => a.attributes("href"));
    expect(hrefs).toContain("/articles?tag=mcp");
    expect(hrefs).toContain("/articles?tag=agent-harness");
  });

  it("uses an h3 title for the h3 variant", async () => {
    const wrapper = await mountSuspended(ArticleCard, { props: { article, variant: "h3" } });
    expect(wrapper.find("h3").exists()).toBe(true);
    expect(wrapper.find("h2").exists()).toBe(false);
  });
});
