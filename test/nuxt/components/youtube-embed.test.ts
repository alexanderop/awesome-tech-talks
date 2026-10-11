import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import YouTubeEmbed from "~/components/YouTubeEmbed.vue";

const props = { videoId: "dQw4w9WgXcQ", title: "Hello Talk" };

describe("YouTubeEmbed", () => {
  it("shows an accessible play button and no iframe initially", async () => {
    const wrapper = await mountSuspended(YouTubeEmbed, { props });
    expect(wrapper.find("iframe").exists()).toBe(false);
    expect(wrapper.find("button").attributes("aria-label")).toBe("Play video: Hello Talk");
    expect(wrapper.find("img").attributes("src")).toContain("/vi/dQw4w9WgXcQ/");
  });

  it("swaps to a privacy-friendly autoplay iframe on click", async () => {
    const wrapper = await mountSuspended(YouTubeEmbed, { props });
    await wrapper.find("button").trigger("click");
    const iframe = wrapper.find("iframe");
    expect(iframe.attributes("src")).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1");
    expect(iframe.attributes("title")).toBe("Hello Talk");
    expect(wrapper.find("button").exists()).toBe(false);
  });
});
