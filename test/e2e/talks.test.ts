import { expect, test } from "./test-utils";

const CONTENT_TIMEOUT = 15_000;

test.describe("talk filters", () => {
  test("channels page links to a channel-filtered talk list", async ({ page, goto }) => {
    await goto("/channels", { waitUntil: "hydration" });
    const row = page.getByRole("listitem").filter({ hasText: "The Pragmatic Engineer" });
    await expect(row.getByRole("link", { name: /YouTube/ })).toHaveAttribute(
      "href",
      "https://www.youtube.com/channel/UCPbwhExawYrn9xxI21TFfyw"
    );
    await row.getByRole("link", { name: "View talks" }).click();
    await expect(page).toHaveURL(/\/talks\/?\?channel=UCPbwhExawYrn9xxI21TFfyw$/);
    await expect(page.locator("#active-filters")).toContainText("Channel: The Pragmatic Engineer", { timeout: CONTENT_TIMEOUT });
    await expect(page.getByRole("link", { name: /The state of the tech industry/ }).first()).toBeVisible();
  });

  test("speaker filter shows an indicator and clears", async ({ page, goto }) => {
    await goto("/talks?speaker=gergely-orosz", { waitUntil: "hydration" });
    await expect(page.locator("#active-filters")).toContainText("Speaker: Gergely Orosz", { timeout: CONTENT_TIMEOUT });
    await page.locator("#active-filters").getByRole("link", { name: "clear" }).click();
    await expect(page.locator("#active-filters")).toHaveCount(0);
  });

  test("people page lists speakers", async ({ page, goto }) => {
    await goto("/people", { waitUntil: "hydration" });
    await expect(page.getByRole("heading", { level: 2, name: "Gergely Orosz" })).toBeVisible();
  });

  test("old /speakers URL redirects to /people", async ({ page }) => {
    await page.goto("/speakers");
    await expect(page).toHaveURL(/\/people\/?$/);
    await expect(page.getByRole("heading", { level: 1, name: "People" })).toBeVisible();
  });
});
