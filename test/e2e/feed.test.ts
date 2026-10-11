import type { APIRequestContext } from "@playwright/test";
import type { CollectedFeed } from "../../shared/utils/feed";
import { expect, test } from "./test-utils";

const CONTENT_TIMEOUT = 15_000;

// The feed is a snapshot of live RSS feeds taken at build time, so these tests
// compare the page with the prerendered JSON instead of hard-coding posts.
async function loadFeed(request: APIRequestContext) {
  const feed: CollectedFeed = await (await request.get("/api/feed.json")).json();
  test.skip(feed.items.length === 0, "build collected no feed items (offline build)");
  return feed;
}

test.describe("feed", () => {
  test("renders the prerendered items without calling the API", async ({ page, goto, request }) => {
    const feed = await loadFeed(request);
    const apiCalls: string[] = [];
    page.on("request", req => {
      if (req.url().includes("/api/feed.json")) apiCalls.push(req.url());
    });

    await goto("/feed", { waitUntil: "hydration" });
    await expect(page.getByRole("heading", { level: 1, name: "Feed" })).toBeVisible();
    await expect(page.locator("#feed-updated")).toContainText("Updated");

    const first = feed.items[0]!;
    const link = page.locator("#feed-river").getByRole("link", { name: first.title, exact: true }).first();
    await expect(link).toBeVisible({ timeout: CONTENT_TIMEOUT });
    await expect(link).toHaveAttribute("href", first.url);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
    await expect(page.locator("#feed-river li")).toHaveCount(feed.items.length);
    await expect(page.locator("#feed-river h2").first()).toBeVisible();
    await expect(page.locator("[data-pagefind-body]")).toHaveCount(0);
    expect(apiCalls).toEqual([]);
  });

  test("source filter narrows the list and is kept in the URL", async ({ page, goto, request }) => {
    const feed = await loadFeed(request);
    await goto("/feed", { waitUntil: "hydration" });

    const option = page.locator("#filter-source option").nth(1);
    const label = (await option.textContent())!;
    const [, name, count] = label.match(/^(.*) \((\d+)\)$/)!;
    const value = (await option.getAttribute("value"))!;

    await page.locator("#filter-source").selectOption(value);
    await expect(page).toHaveURL(new RegExp(`source=${encodeURIComponent(value)}`));
    await expect(page.locator("#feed-river li")).toHaveCount(Number(count), { timeout: CONTENT_TIMEOUT });
    for (const source of await page.locator("#feed-river li p span a").allTextContents()) expect(source).toBe(name);
    await expect(page.getByText(`${count} of ${feed.items.length} posts`)).toBeVisible();

    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(page.locator("#feed-river li")).toHaveCount(feed.items.length);
    await expect(page).not.toHaveURL(/source=/);
  });

  test("a shared ?source= link is applied on load", async ({ page, goto, request }) => {
    const feed = await loadFeed(request);
    const source = feed.items[0]!.source;
    const expected = feed.items.filter(item => item.source === source).length;
    await goto("/feed", { waitUntil: "hydration" });
    const value = await page.locator("#filter-source option", { hasText: `${source} (` }).getAttribute("value");
    await goto(`/feed?source=${value}`, { waitUntil: "hydration" });
    await expect(page.locator("#feed-river li")).toHaveCount(expected, { timeout: CONTENT_TIMEOUT });
  });

  test("lists every source with its feed link", async ({ page, goto, request }) => {
    const feed = await loadFeed(request);
    await goto("/feed", { waitUntil: "hydration" });
    const sources = page.locator("#feed-sources");
    await expect(sources.locator("summary")).toContainText("Sources");
    await sources.locator("summary").click();
    await expect(sources.locator("li")).toHaveCount(feed.sources.length);
    const first = feed.sources[0]!;
    await expect(sources.getByRole("link", { name: first.name, exact: true })).toHaveAttribute("href", first.url);
    await expect(sources.locator(`a[href="${first.feed}"]`)).toBeVisible();
  });

  test("home → Feed navigates client-side without calling the API", async ({ page, goto, request }) => {
    const feed = await loadFeed(request);
    await goto("/", { waitUntil: "hydration" });

    const teaser = page.locator("#from-the-feed");
    await expect(teaser.getByRole("link", { name: feed.items[0]!.title, exact: true })).toHaveAttribute("href", feed.items[0]!.url);
    await expect(teaser.locator("li")).toHaveCount(Math.min(5, feed.items.length));

    const apiCalls: string[] = [];
    page.on("request", req => {
      if (req.url().includes("/api/feed.json")) apiCalls.push(req.url());
    });
    await page.evaluate(() => {
      (window as unknown as { spaMarker: boolean }).spaMarker = true;
    });
    await teaser.getByRole("link", { name: /Full feed/ }).click();
    await expect(page).toHaveURL(/\/feed\/?$/);
    await expect(page.locator("#feed-river li")).toHaveCount(feed.items.length, { timeout: CONTENT_TIMEOUT });
    expect(await page.evaluate(() => (window as unknown as { spaMarker?: boolean }).spaMarker)).toBe(true);
    expect(apiCalls).toEqual([]);

    await expect(page.locator("#menu-items a.active-nav")).toHaveText("Feed");
  });
});
