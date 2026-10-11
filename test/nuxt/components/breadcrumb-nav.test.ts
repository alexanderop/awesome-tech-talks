import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BreadcrumbNav from "~/components/BreadcrumbNav.vue";

const route = { path: "/" };

mockNuxtImport("useRoute", () => () => route);

describe("BreadcrumbNav", () => {
  beforeEach(() => {
    route.path = "/";
    vi.clearAllMocks();
  });

  it("always renders a Home crumb", async () => {
    const wrapper = await mountSuspended(BreadcrumbNav);
    const home = wrapper.find("a");
    expect(home.text()).toBe("Home");
    expect(home.attributes("href")).toBe("/");
  });

  it("renders a known nav label and marks the last crumb as current", async () => {
    route.path = "/tags";
    const wrapper = await mountSuspended(BreadcrumbNav);
    const current = wrapper.find("[aria-current='page']");
    expect(current.exists()).toBe(true);
    expect(current.text()).toBe("Tags");
  });

  it("labels the channels, articles and people pages", async () => {
    route.path = "/channels";
    expect((await mountSuspended(BreadcrumbNav)).find("[aria-current='page']").text()).toBe("Channels");
    route.path = "/articles";
    expect((await mountSuspended(BreadcrumbNav)).find("[aria-current='page']").text()).toBe("Articles");
    route.path = "/people";
    expect((await mountSuspended(BreadcrumbNav)).find("[aria-current='page']").text()).toBe("People");
  });

  it("labels the feed page", async () => {
    route.path = "/feed";
    expect((await mountSuspended(BreadcrumbNav)).find("[aria-current='page']").text()).toBe("Feed");
  });

  it("falls back to the decoded path segment for a talk page", async () => {
    route.path = "/talks/my-talk";
    const wrapper = await mountSuspended(BreadcrumbNav);
    const current = wrapper.find("[aria-current='page']");
    expect(current.text()).toContain("my-talk");
  });
});
