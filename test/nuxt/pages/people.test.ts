import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import PeoplePage from "~/pages/people.vue";
import { makeArticle } from "./_article-helpers";
import { makeTalk } from "./_talk-helpers";

const { talks, articles } = vi.hoisted(() => {
  const { ref } = require("vue");
  return { talks: ref([]), articles: ref([]) };
});

mockNuxtImport("useAllTalks", () => () => ({ data: talks }));
mockNuxtImport("useAllArticles", () => () => ({ data: articles }));

talks.value = [
  makeTalk({ path: "/talks/a", speakers: ["Zed Zebra", "Ann Ant"] }),
  makeTalk({ path: "/talks/b", speakers: ["Ann Ant"] }),
];
articles.value = [
  makeArticle({ path: "/articles/a", authors: ["Ann Ant"] }),
  makeArticle({ path: "/articles/b", authors: ["Wally Writer"] }),
];

describe("people page", () => {
  it("renders the title", async () => {
    const wrapper = await mountSuspended(PeoplePage);
    expect(wrapper.find("h1").text()).toBe("People");
  });

  it("lists speakers and authors alphabetically", async () => {
    const wrapper = await mountSuspended(PeoplePage);
    const names = wrapper.findAll("h2").map(h => h.text());
    expect(names.indexOf("Ann Ant")).toBeLessThan(names.indexOf("Wally Writer"));
    expect(names.indexOf("Wally Writer")).toBeLessThan(names.indexOf("Zed Zebra"));
  });

  it("shows talk and article counts with links to both filtered lists", async () => {
    const wrapper = await mountSuspended(PeoplePage);
    const ann = wrapper.findAll("li").find(li => li.text().includes("Ann Ant"));
    expect(ann?.text()).toContain("2 talks");
    expect(ann?.text()).toContain("1 article");
    const hrefs = ann?.findAll("a").map(a => a.attributes("href"));
    expect(hrefs).toEqual(["/talks?speaker=ann-ant", "/articles?author=ann-ant"]);
  });

  it("only links the lists a person actually has content in", async () => {
    const wrapper = await mountSuspended(PeoplePage);
    const zed = wrapper.findAll("li").find(li => li.text().includes("Zed Zebra"));
    expect(zed?.findAll("a").map(a => a.attributes("href"))).toEqual(["/talks?speaker=zed-zebra"]);
    const wally = wrapper.findAll("li").find(li => li.text().includes("Wally Writer"));
    expect(wally?.text()).toContain("1 article");
    expect(wally?.findAll("a").map(a => a.attributes("href"))).toEqual(["/articles?author=wally-writer"]);
  });

  it("marks followed speakers without content and does not link them", async () => {
    const wrapper = await mountSuspended(PeoplePage);
    const followed = wrapper.findAll("li").find(li => li.text().includes(followedSpeakers[0]!));
    expect(followed?.text()).toContain("followed");
    expect(followed?.find("a").exists()).toBe(false);
  });
});
