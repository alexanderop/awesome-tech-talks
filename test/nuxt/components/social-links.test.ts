import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import SocialLinks from "~/components/SocialLinks.vue";

describe("SocialLinks", () => {
  it("renders one link per configured social with its url", async () => {
    const wrapper = await mountSuspended(SocialLinks);
    const links = wrapper.findAll("a");
    expect(links).toHaveLength(3);
    const hrefs = links.map(a => a.attributes("href"));
    expect(hrefs).toContain("https://github.com/alexanderop");
    expect(hrefs).not.toContain("mailto:yourmail@gmail.com");
  });

  it("gives each link an accessible title", async () => {
    const wrapper = await mountSuspended(SocialLinks);
    const titles = wrapper.findAll("a").map(a => a.attributes("title"));
    expect(titles.every(Boolean)).toBe(true);
    expect(titles.some(title => title?.includes("Awesome Tech Talks"))).toBe(true);
  });
});
