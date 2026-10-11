import { expect, test } from "./test-utils";

const CONTENT_TIMEOUT = 15_000;
const TALK = /The state of the tech industry/;

test.describe("navigation", () => {
  test("home page hydrates cleanly", async ({ goto, hydrationErrors }) => {
    await goto("/", { waitUntil: "hydration" });
    expect(hydrationErrors).toEqual([]);
  });

  test("home → click a talk → land on the talk page", async ({ page, goto }) => {
    await goto("/", { waitUntil: "hydration" });

    const talkLink = page.getByRole("link", { name: TALK }).first();
    await expect(talkLink).toBeVisible({ timeout: CONTENT_TIMEOUT });
    await talkLink.click();

    await expect(page).toHaveURL(/\/talks\/state-of-the-tech-industry-2026\/?$/);
    await expect(page.getByRole("heading", { level: 1, name: TALK })).toBeVisible({ timeout: CONTENT_TIMEOUT });
  });

  test("home → click an article → land on the article page", async ({ page, goto }) => {
    await goto("/", { waitUntil: "hydration" });
    const link = page.locator("#latest-articles").getByRole("link", { name: /What is Codemode/ }).first();
    await expect(link).toBeVisible({ timeout: CONTENT_TIMEOUT });
    await link.click();
    await expect(page).toHaveURL(/\/articles\/what-is-codemode\/?$/);
    await expect(page.getByRole("heading", { level: 1, name: /What is Codemode/ })).toBeVisible({ timeout: CONTENT_TIMEOUT });
  });

  test("home stats link to the channels and people pages", async ({ page, goto }) => {
    await goto("/", { waitUntil: "hydration" });
    await page.locator("#stats").getByRole("link", { name: /channels/ }).click();
    await expect(page).toHaveURL(/\/channels\/?$/);
    await expect(page.getByRole("heading", { level: 1, name: "Channels" })).toBeVisible();
  });
});

test("skip link moves keyboard focus to main content", async ({ page, goto }) => {
  await goto("/", { waitUntil: "hydration" });
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

for (const path of ["/talks/", "/articles/", "/channels/", "/people/", "/tags/", "/about/", "/talks/state-of-the-tech-industry-2026/", "/articles/what-is-codemode/"]) {
  test(`initial ${path} does not start a route transition during hydration`, async ({ page, goto }) => {
    await page.addInitScript(() => {
      let starts = 0;
      const start = document.startViewTransition.bind(document);
      document.startViewTransition = (...args) => {
        starts++;
        document.documentElement.dataset.initialTransitions = String(starts);
        return start(...args);
      };
    });
    await goto(path, { waitUntil: "hydration" });
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#main-content")).toBeVisible();
    if (path === "/about/") await expect(page.getByRole("link", { name: "Link to this section" })).toHaveCount(0);
    expect(await page.locator("html").getAttribute("data-initial-transitions")).toBeNull();
  });
}
