import { flushPromises } from "@vue/test-utils";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FeedPage from "~/pages/feed.vue";
import { makeFeed, makeFeedItem, makeFeedStatus } from "./_feed-helpers";

const { feed } = vi.hoisted(() => {
  const { ref } = require("vue");
  return { feed: ref(undefined) };
});

mockNuxtImport("useFeed", () => () => ({ data: feed }));

// "Now" is the evening of 11 Oct 2026 (Europe/Berlin).
const NOW = Date.parse("2026-10-11T18:00:00.000Z");

function setFeed() {
  feed.value = makeFeed({
    generatedAt: "2026-10-11T16:00:00.000Z",
    sources: [
      makeFeedStatus({ name: "Julia Evans", url: "https://jvns.ca", feed: "https://jvns.ca/atom.xml" }),
      makeFeedStatus({ name: "antirez", url: "https://antirez.com", feed: "https://antirez.com/rss", ok: false, error: "HTTP 503" }),
    ],
    items: [
      makeFeedItem({ title: "Today post", url: "https://jvns.ca/today", date: "2026-10-11T08:30:00.000Z", source: "Julia Evans", sourceUrl: "https://jvns.ca" }),
      makeFeedItem({ title: "Yesterday post", url: "https://antirez.com/yesterday", date: "2026-10-10T20:00:00.000Z", source: "antirez", sourceUrl: "https://antirez.com" }),
      makeFeedItem({ title: "Older post", url: "https://jvns.ca/older", date: "2026-10-05T10:00:00.000Z", source: "Julia Evans", sourceUrl: "https://jvns.ca" }),
      makeFeedItem({ title: "Undated post", url: "https://antirez.com/undated", date: null, source: "antirez", sourceUrl: "https://antirez.com" }),
    ],
  });
}

async function mountAt(route: string) {
  const wrapper = await mountSuspended(FeedPage, { route });
  await flushPromises();
  return wrapper;
}

const titles = (wrapper: Awaited<ReturnType<typeof mountAt>>) => wrapper.findAll("#feed-river li p > a").map(a => a.text());
const headings = (wrapper: Awaited<ReturnType<typeof mountAt>>) => wrapper.findAll("#feed-river h2").map(h => h.text());

describe("feed page", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
    setFeed();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders the title, the description and when the feed was updated", async () => {
    const wrapper = await mountAt("/feed");
    expect(wrapper.find("h1").text()).toBe("Feed");
    expect(wrapper.text()).toContain("Latest posts from blogs I read. Collected automatically, not curated.");
    expect(wrapper.find("#feed-updated").text()).toBe("Updated 2 hours ago");
    expect(wrapper.find("#feed-updated time").attributes("datetime")).toBe("2026-10-11T16:00:00.000Z");
  });

  it("groups posts by day, newest first, with undated posts last", async () => {
    const wrapper = await mountAt("/feed");
    expect(headings(wrapper)).toEqual(["Today", "Yesterday", "Monday, 5 Oct", "Undated"]);
    expect(titles(wrapper)).toEqual(["Today post", "Yesterday post", "Older post", "Undated post"]);
  });

  it("shows the time of day in the site timezone", async () => {
    const wrapper = await mountAt("/feed");
    const times = wrapper.findAll("#feed-river li time").map(time => time.text());
    // 08:30 UTC is 10:30 in Europe/Berlin (CEST); the undated post has no time.
    expect(times).toEqual(["10:30", "22:00", "12:00"]);
  });

  it("omits the time for posts that only have a date", async () => {
    feed.value = makeFeed({ items: [makeFeedItem({ title: "Date only", date: "2026-10-11T00:00:00.000Z" })] });
    const wrapper = await mountAt("/feed");
    expect(headings(wrapper)).toEqual(["Today"]);
    expect(wrapper.find("#feed-river li time").exists()).toBe(false);
  });

  it("opens posts and sources in a new tab without leaking the opener", async () => {
    const wrapper = await mountAt("/feed");
    const links = wrapper.findAll("#feed-river a");
    expect(links.length).toBe(8);
    for (const link of links) {
      expect(link.attributes("target")).toBe("_blank");
      expect(link.attributes("rel")).toContain("noopener");
    }
    const first = wrapper.find("#feed-river li");
    expect(first.findAll("a").map(a => a.attributes("href"))).toEqual(["https://jvns.ca/today", "https://jvns.ca"]);
    expect(first.text()).toContain("Julia Evans");
  });

  it("is not part of the site search index", async () => {
    const wrapper = await mountAt("/feed");
    expect(wrapper.find("[data-pagefind-body]").exists()).toBe(false);
  });

  it("offers a source filter with counts", async () => {
    const wrapper = await mountAt("/feed");
    expect(wrapper.find("#filter-source").findAll("option").map(o => o.text())).toEqual(["All", "antirez (2)", "Julia Evans (2)"]);
    expect(wrapper.text()).toContain("4 of 4 posts");
  });

  it("applies the source filter from the URL", async () => {
    const wrapper = await mountAt("/feed?source=julia-evans");
    expect(titles(wrapper)).toEqual(["Today post", "Older post"]);
    expect(headings(wrapper)).toEqual(["Today", "Monday, 5 Oct"]);
    expect(wrapper.text()).toContain("2 of 4 posts");
    expect(wrapper.find("#filter-source").element).toHaveProperty("value", "julia-evans");
  });

  it("shows a message when the source matches nothing", async () => {
    const wrapper = await mountAt("/feed?source=nobody");
    expect(titles(wrapper)).toEqual([]);
    expect(wrapper.text()).toContain("No posts match this filter.");
  });

  it("writes a changed select to the URL query and clears it again", async () => {
    const replace = vi.spyOn(useRouter(), "replace").mockResolvedValue(undefined);
    const wrapper = await mountAt("/feed");
    await wrapper.find("#filter-source").setValue("antirez");
    expect(replace).toHaveBeenLastCalledWith({ query: expect.objectContaining({ source: "antirez" }) });
    await wrapper.find("#filter-source").setValue("");
    expect(replace).toHaveBeenLastCalledWith({ query: expect.objectContaining({ source: undefined }) });
  });

  it("clears the filter", async () => {
    const replace = vi.spyOn(useRouter(), "replace").mockResolvedValue(undefined);
    const wrapper = await mountAt("/feed?source=antirez");
    await wrapper.find("form button").trigger("click");
    expect(replace).toHaveBeenLastCalledWith({ query: {} });
  });

  it("lists every source with its feed and flags the ones that failed", async () => {
    const wrapper = await mountAt("/feed");
    const sources = wrapper.find("#feed-sources");
    expect(sources.element.tagName).toBe("DETAILS");
    expect(sources.find("summary").text().replace(/\s+/g, " ")).toContain("Sources (2, ⚠ 1 failed)");
    const rows = sources.findAll("li");
    expect(rows.map(row => row.find("a").text())).toEqual(["Julia Evans", "antirez"]);
    expect(rows[0]!.findAll("a").map(a => a.attributes("href"))).toEqual(["https://jvns.ca", "https://jvns.ca/atom.xml"]);
    expect(rows[0]!.text()).not.toContain("⚠");
    expect(rows[1]!.text()).toContain("⚠");
    expect(rows[1]!.text()).toContain("HTTP 503");
  });

  it("shows an empty state, but still the sources, when no posts could be collected", async () => {
    feed.value = makeFeed({ items: [], sources: [makeFeedStatus({ ok: false, error: "HTTP 500" })] });
    const wrapper = await mountAt("/feed");
    expect(wrapper.find("#feed-empty").text()).toContain("No posts could be loaded right now.");
    expect(wrapper.find("form").exists()).toBe(false);
    expect(wrapper.find("#feed-sources").text()).toContain("HTTP 500");
  });

  it("shows an empty state when the feed could not be fetched at all", async () => {
    feed.value = undefined;
    const wrapper = await mountAt("/feed");
    expect(wrapper.find("h1").text()).toBe("Feed");
    expect(wrapper.find("#feed-empty").exists()).toBe(true);
    expect(wrapper.find("#feed-updated").exists()).toBe(false);
    expect(wrapper.find("#feed-sources").exists()).toBe(false);
  });
});
