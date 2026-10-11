import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import TagsIndexPage from "~/pages/tags/index.vue";
import { makeArticle } from "./_article-helpers";
import { makeTalk } from "./_talk-helpers";

const { talks, articles } = vi.hoisted(() => {
  const { ref } = require("vue");
  return { talks: ref([]), articles: ref([]) };
});

mockNuxtImport("useAllTalks", () => () => ({ data: talks }));
mockNuxtImport("useAllArticles", () => () => ({ data: articles }));

talks.value = [
  makeTalk({ path: "/talks/a", tags: ["Vue", "Nuxt"] }),
  makeTalk({ path: "/talks/b", tags: ["Testing", "Vue"] }),
];
articles.value = [makeArticle({ path: "/articles/a", tags: ["vue", "MCP"] })];

describe("tags index page", () => {
  it("renders the page title and description", async () => {
    const wrapper = await mountSuspended(TagsIndexPage);
    expect(wrapper.find("h1").text()).toBe("Tags");
    expect(wrapper.text()).toContain("Every topic tag used on talks and articles");
  });

  it("links a tag used in both collections to both filtered lists with separate counts", async () => {
    const wrapper = await mountSuspended(TagsIndexPage);
    const vue = wrapper.findAll("li").find(li => li.text().includes("Vue"));
    expect(vue?.text()).toContain("2 talks");
    expect(vue?.text()).toContain("1 article");
    expect(vue?.findAll("a").map(a => a.attributes("href"))).toEqual(["/talks?tag=vue", "/articles?tag=vue"]);
  });

  it("only links the collection a tag is used in", async () => {
    const wrapper = await mountSuspended(TagsIndexPage);
    const nuxt = wrapper.findAll("li").find(li => li.text().includes("Nuxt"));
    expect(nuxt?.findAll("a").map(a => a.attributes("href"))).toEqual(["/talks?tag=nuxt"]);
    const mcp = wrapper.findAll("li").find(li => li.text().includes("MCP"));
    expect(mcp?.findAll("a").map(a => a.attributes("href"))).toEqual(["/articles?tag=mcp"]);
  });
});
