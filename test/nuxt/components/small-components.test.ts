import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import FilterSelect from "~/components/FilterSelect.vue";
import LevelBadge from "~/components/LevelBadge.vue";
import OriginalLink from "~/components/OriginalLink.vue";

describe("LevelBadge", () => {
  it("renders the level label", async () => {
    expect((await mountSuspended(LevelBadge, { props: { level: "advanced" } })).text()).toBe("Advanced");
    expect((await mountSuspended(LevelBadge, { props: { level: "beginner" } })).text()).toBe("Beginner");
  });
});

describe("OriginalLink", () => {
  it("opens the original post in a new tab and names the site", async () => {
    const wrapper = await mountSuspended(OriginalLink, { props: { url: "https://blog.example.com/p/", site: "Example Blog" } });
    const link = wrapper.find("a");
    expect(link.text()).toBe("Read the original on Example Blog ↗");
    expect(link.attributes("href")).toBe("https://blog.example.com/p/");
    expect(link.attributes("target")).toBe("_blank");
    expect(link.attributes("rel")).toContain("noopener");
  });
});

describe("FilterSelect", () => {
  const props = {
    id: "filter-x",
    label: "Thing",
    anyLabel: "All",
    value: "b",
    options: [
      { value: "a", label: "Alpha" },
      { value: "b", label: "Beta" },
    ],
  };

  it("renders an any option plus the given options with the current value selected", async () => {
    const wrapper = await mountSuspended(FilterSelect, { props });
    expect(wrapper.findAll("option").map(option => option.text())).toEqual(["All", "Alpha", "Beta"]);
    expect((wrapper.find("select").element as HTMLSelectElement).value).toBe("b");
  });

  it("emits the chosen value on change", async () => {
    const wrapper = await mountSuspended(FilterSelect, { props });
    await wrapper.find("select").setValue("a");
    expect(wrapper.emitted("change")?.[0]).toEqual(["a"]);
  });
});
