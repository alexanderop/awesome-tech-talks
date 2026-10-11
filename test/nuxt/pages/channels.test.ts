import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import ChannelsPage from "~/pages/channels.vue";
import { makeTalk } from "./_talk-helpers";

const { talks } = vi.hoisted(() => {
  const { ref } = require("vue");
  return { talks: ref([]) };
});

mockNuxtImport("useAllTalks", () => () => ({ data: talks }));

talks.value = [
  makeTalk({ path: "/talks/a", channel: "Only In Talks", channelId: "UCexampleexampleexample00" }),
  makeTalk({ path: "/talks/b", channel: "Only In Talks", channelId: "UCexampleexampleexample00" }),
];

describe("channels page", () => {
  it("renders the title and the explanation", async () => {
    const wrapper = await mountSuspended(ChannelsPage);
    expect(wrapper.find("h1").text()).toBe("Channels");
    expect(wrapper.text()).toContain("channels this site follows");
  });

  it("lists followed channels from data/sources.json even without talks", async () => {
    const wrapper = await mountSuspended(ChannelsPage);
    for (const channel of followedChannels) expect(wrapper.text()).toContain(channel.name);
    const hrefs = wrapper.findAll("a").map(a => a.attributes("href"));
    expect(hrefs).toContain(`https://www.youtube.com/channel/${followedChannels[0]!.id}`);
  });

  it("merges channels that only appear in talks, sorted by count first", async () => {
    const wrapper = await mountSuspended(ChannelsPage);
    const rows = wrapper.findAll("main ul > li");
    expect(rows[0]!.text()).toContain("Only In Talks");
    expect(rows[0]!.text()).toContain("2 talks");
  });

  it("links to the filtered talk list only when the channel has talks", async () => {
    const wrapper = await mountSuspended(ChannelsPage);
    const hrefs = wrapper.findAll("a").map(a => a.attributes("href"));
    expect(hrefs).toContain("/talks?channel=UCexampleexampleexample00");
    expect(hrefs.filter(href => href?.startsWith("/talks?channel="))).toHaveLength(1);
  });
});
