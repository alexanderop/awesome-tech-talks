import { expect, test } from "./test-utils";

const CONTENT_TIMEOUT = 15_000;
const ORIGINAL = "https://lucumr.pocoo.org/2026/10/6/codemode/";

test.describe("articles", () => {
  test("detail page links to the original post at the top and bottom", async ({ page, goto }) => {
    await goto("/articles/what-is-codemode", { waitUntil: "hydration" });
    await expect(page.getByRole("heading", { level: 1, name: "What is Codemode" })).toBeVisible();
    const links = page.getByRole("link", { name: /Read the original on Armin Ronacher/ });
    await expect(links).toHaveCount(2);
    await expect(links.first()).toHaveAttribute("href", ORIGINAL);
    await expect(links.last()).toHaveAttribute("href", ORIGINAL);
    await expect(links.first()).toHaveAttribute("target", "_blank");
    await expect(links.last()).toHaveAttribute("target", "_blank");
    await expect(page.locator("#article")).toContainText("Key takeaways");
  });

  test("author filter shows an indicator and clears", async ({ page, goto }) => {
    await goto("/articles?author=armin-ronacher", { waitUntil: "hydration" });
    await expect(page.locator("#active-filters")).toContainText("Author: Armin Ronacher", { timeout: CONTENT_TIMEOUT });
    await expect(page.getByRole("link", { name: "What is Codemode" }).first()).toBeVisible();
    await page.locator("#active-filters").getByRole("link", { name: "clear" }).click();
    await expect(page.locator("#active-filters")).toHaveCount(0);
  });

  test("unknown article slug is a 404", async ({ request }) => {
    const res = await request.get("/articles/does-not-exist");
    expect(res.status()).toBe(404);
  });

  test("tags page links a shared tag to both lists", async ({ page, goto }) => {
    await goto("/tags", { waitUntil: "hydration" });
    await expect(page.locator("#main-content a[href$='/talks?tag=ai']")).toHaveText("2 talks");
    await expect(page.locator("#main-content a[href$='/articles?tag=ai']")).toHaveText("1 article");
  });
});
