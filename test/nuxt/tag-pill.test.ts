import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import TagPill from "~/components/TagPill.vue";

describe("TagPill", () => {
  it("renders the tag name and links to the filtered talks list", async () => {
    const wrapper = await mountSuspended(TagPill, {
      props: { tag: "e2e-testing", tagName: "E2E Testing" },
    });
    expect(wrapper.text()).toContain("E2E Testing");
    expect(wrapper.find("a").attributes("href")).toBe("/talks?tag=e2e-testing");
  });

  it("links to the filtered articles list for the articles kind", async () => {
    const wrapper = await mountSuspended(TagPill, {
      props: { tag: "mcp", tagName: "MCP", kind: "articles" },
    });
    expect(wrapper.find("a").attributes("href")).toBe("/articles?tag=mcp");
  });

  it("shows the talk count when given", async () => {
    const wrapper = await mountSuspended(TagPill, {
      props: { tag: "vue", tagName: "Vue", count: 3 },
    });
    expect(wrapper.text()).toContain("3");
  });

  it("applies the small size variant", async () => {
    const wrapper = await mountSuspended(TagPill, {
      props: { tag: "vue", tagName: "Vue", size: "sm" },
    });
    expect(wrapper.find("a").classes()).toContain("text-sm");
  });
});
