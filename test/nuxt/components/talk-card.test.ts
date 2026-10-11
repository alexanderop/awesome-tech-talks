import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import TalkCard from "~/components/TalkCard.vue";
import { makeTalk } from "../pages/_talk-helpers";

const talk = makeTalk({
  path: "/talks/hello-talk",
  title: "Hello Talk",
  speakers: ["Jane Doe", "John Roe"],
  tags: ["architecture", "Domain Driven Design"],
});

describe("TalkCard", () => {
  it("renders a lazy YouTube thumbnail", async () => {
    const wrapper = await mountSuspended(TalkCard, { props: { talk } });
    const img = wrapper.find("img");
    expect(img.attributes("src")).toBe("https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
    expect(img.attributes("loading")).toBe("lazy");
    expect(img.attributes("alt")).toContain("Hello Talk");
  });

  it("links the title to the talk path", async () => {
    const wrapper = await mountSuspended(TalkCard, { props: { talk } });
    const link = wrapper.find("h2").element.closest("a");
    expect(link?.getAttribute("href")).toBe("/talks/hello-talk");
  });

  it("renders speakers, conference, duration and level", async () => {
    const wrapper = await mountSuspended(TalkCard, { props: { talk } });
    expect(wrapper.text()).toContain("Jane Doe, John Roe");
    expect(wrapper.text()).toContain("Example Conf");
    expect(wrapper.text()).toContain("42 min");
    expect(wrapper.text()).toContain("Intermediate");
  });

  it("links each speaker to the speaker-filtered talks list", async () => {
    const wrapper = await mountSuspended(TalkCard, { props: { talk } });
    const hrefs = wrapper.findAll("a").map(a => a.attributes("href"));
    expect(hrefs).toContain("/talks?speaker=jane-doe");
    expect(hrefs).toContain("/talks?speaker=john-roe");
  });

  it("links tags to the filtered talks list", async () => {
    const wrapper = await mountSuspended(TalkCard, { props: { talk } });
    const hrefs = wrapper.findAll("ul a").map(a => a.attributes("href"));
    expect(hrefs).toContain("/talks?tag=architecture");
    expect(hrefs).toContain("/talks?tag=domain-driven-design");
  });

  it("uses an h3 title for the h3 variant", async () => {
    const wrapper = await mountSuspended(TalkCard, { props: { talk, variant: "h3" } });
    expect(wrapper.find("h3").exists()).toBe(true);
    expect(wrapper.find("h2").exists()).toBe(false);
  });
});
