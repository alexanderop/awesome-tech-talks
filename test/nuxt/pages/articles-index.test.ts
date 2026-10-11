import { flushPromises } from "@vue/test-utils";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, it, vi } from "vitest";
import ArticlesIndexPage from "~/pages/articles/index.vue";
import { makeArticle } from "./_article-helpers";

const { articles } = vi.hoisted(() => {
  const { ref } = require("vue");
  return { articles: ref([]) };
});

mockNuxtImport("useAllArticles", () => () => ({ data: articles }));

articles.value = [
  makeArticle({ path: "/articles/a", title: "Alpha Post", authors: ["Ann Author"], tags: ["MCP"], level: "advanced" }),
  makeArticle({ path: "/articles/b", title: "Beta Post", authors: ["Bob Writer"], tags: ["testing"], level: "beginner" }),
  makeArticle({ path: "/articles/c", title: "Gamma Post", authors: ["Ann Author"], tags: ["testing"], level: "advanced" }),
];

async function mountAt(route: string) {
  const wrapper = await mountSuspended(ArticlesIndexPage, { route });
  await flushPromises();
  return wrapper;
}

const titles = (wrapper: Awaited<ReturnType<typeof mountAt>>) => wrapper.findAll("h3").map(h => h.text());

describe("articles index page", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the title and every article without filters", async () => {
    const wrapper = await mountAt("/articles");
    expect(wrapper.find("h1").text()).toBe("Articles");
    expect(titles(wrapper)).toEqual(["Alpha Post", "Beta Post", "Gamma Post"]);
    expect(wrapper.text()).toContain("3 of 3 articles");
    expect(wrapper.find("#active-filters").exists()).toBe(false);
  });

  it("offers tag, level and author filters", async () => {
    const wrapper = await mountAt("/articles");
    expect(wrapper.find("#filter-tag").findAll("option").map(o => o.text())).toEqual(["All", "MCP", "testing"]);
    expect(wrapper.find("#filter-level").findAll("option").map(o => o.text())).toEqual(["All", "Beginner", "Advanced"]);
    expect(wrapper.find("#filter-author").findAll("option").map(o => o.text())).toEqual(["All", "Ann Author", "Bob Writer"]);
  });

  it("applies the author filter from the URL and shows an indicator", async () => {
    const wrapper = await mountAt("/articles?author=ann-author");
    expect(titles(wrapper)).toEqual(["Alpha Post", "Gamma Post"]);
    expect(wrapper.text()).toContain("2 of 3 articles");
    expect(wrapper.find("#active-filters").text()).toContain("Author: Ann Author");
    expect(wrapper.find("#filter-author").element).toHaveProperty("value", "ann-author");
  });

  it("combines tag and level filters from the URL", async () => {
    const wrapper = await mountAt("/articles?tag=testing&level=advanced");
    expect(titles(wrapper)).toEqual(["Gamma Post"]);
  });

  it("shows an empty message when nothing matches", async () => {
    const wrapper = await mountAt("/articles?tag=mcp&level=beginner");
    expect(titles(wrapper)).toEqual([]);
    expect(wrapper.text()).toContain("No articles match these filters.");
  });

  it("writes a changed select to the URL query and drops the empty ones", async () => {
    const replace = vi.spyOn(useRouter(), "replace").mockResolvedValue(undefined);
    const wrapper = await mountAt("/articles");
    await wrapper.find("#filter-level").setValue("beginner");
    expect(replace).toHaveBeenLastCalledWith({ query: expect.objectContaining({ level: "beginner" }) });
    await wrapper.find("#filter-tag").setValue("");
    expect(replace).toHaveBeenLastCalledWith({ query: expect.objectContaining({ tag: undefined }) });
  });

  it("clears all filters", async () => {
    const replace = vi.spyOn(useRouter(), "replace").mockResolvedValue(undefined);
    const wrapper = await mountAt("/articles?tag=testing");
    await wrapper.find("form button").trigger("click");
    expect(replace).toHaveBeenLastCalledWith({ query: {} });
  });
});
