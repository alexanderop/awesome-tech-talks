import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { reactive } from "vue";
import { beforeEach, describe, expect, it } from "vitest";
import AppHeader from "~/components/AppHeader.vue";

const route = reactive({ path: "/channels" });

mockNuxtImport("useRoute", () => () => route);

describe("AppHeader", () => {
  beforeEach(() => {
    route.path = "/channels";
  });

  it("renders the site title linking home and the primary nav items", async () => {
    const wrapper = await mountSuspended(AppHeader);
    expect(wrapper.text()).toContain("Awesome Tech Talks");
    const labels = wrapper.findAll("#menu-items a").map(a => a.text());
    expect(labels[0]).toBe("Talks");
    expect(labels.slice(0, 8)).toEqual(["Talks", "Articles", "Tweets", "Feed", "Channels", "People", "Tags", "About"]);
    expect(labels).not.toContain("Posts");
    expect(labels).not.toContain("Archives");
    expect(labels).toContain("About");
  });

  it("marks the active nav item based on the current route", async () => {
    const wrapper = await mountSuspended(AppHeader);
    const active = wrapper.find("a.active-nav");
    expect(active.exists()).toBe(true);
    expect(active.text()).toBe("Channels");
  });

  it("marks Articles active on an article page", async () => {
    route.path = "/articles/what-is-codemode";
    const wrapper = await mountSuspended(AppHeader);
    expect(wrapper.find("a.active-nav").text()).toBe("Articles");
  });

  it("marks Feed active on the feed page", async () => {
    route.path = "/feed";
    const wrapper = await mountSuspended(AppHeader);
    expect(wrapper.find("a.active-nav").text()).toBe("Feed");
    expect(wrapper.find("a.active-nav").attributes("href")).toBe("/feed");
  });

  it("keeps Tags in the mobile menu only, so the desktop bar fits", async () => {
    const wrapper = await mountSuspended(AppHeader);
    const hiddenOnDesktop = wrapper.findAll("#menu-items li.md\\:hidden").map(li => li.text());
    expect(hiddenOnDesktop).toEqual(["Tags"]);
    expect(wrapper.find("#menu-items a[href='/tags']").exists()).toBe(true);
  });

  it("toggles the mobile menu open and closed", async () => {
    const wrapper = await mountSuspended(AppHeader);
    const button = wrapper.find("#menu-btn");
    expect(button.attributes("aria-expanded")).toBe("false");
    await button.trigger("click");
    expect(button.attributes("aria-expanded")).toBe("true");
    await button.trigger("click");
    expect(button.attributes("aria-expanded")).toBe("false");
  });

  it("renders a working theme toggle button", async () => {
    const wrapper = await mountSuspended(AppHeader);
    const themeBtn = wrapper.find("#theme-btn");
    expect(themeBtn.exists()).toBe(true);
    await themeBtn.trigger("click");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("provides a skip-to-content link", async () => {
    const wrapper = await mountSuspended(AppHeader);
    const skip = wrapper.find("#skip-to-content");
    expect(skip.attributes("href")).toBe("#main-content");
  });
});
