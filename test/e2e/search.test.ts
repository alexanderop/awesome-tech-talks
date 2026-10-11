import { expect, test } from "./test-utils";

test("Pagefind searches talk text and restores the query after returning", async ({ page, goto }) => {
  await goto("/search", { waitUntil: "hydration" });
  const input = page.getByRole("textbox", { name: "Search" });
  await input.fill("Orosz");
  const result = page.locator(".pagefind-ui__result-title").getByRole("link", { name: /The state of the tech industry/ });
  await expect(result).toBeVisible({ timeout: 15000 });
  await expect(page).toHaveURL(/q=Orosz/);
  await result.click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("The state of the tech industry");
  await page.getByRole("link", { name: /go back/i }).click();
  await expect(input).toHaveValue("Orosz");
  await expect(result).toBeVisible();
  await page.getByRole("button", { name: /clear/i }).click();
  await expect(page).not.toHaveURL(/q=/);
});

test("a shared query searches immediately and survives a reload", async ({ page, goto }) => {
  await goto("/search/?q=Orosz", { waitUntil: "hydration" });
  const input = page.getByRole("textbox", { name: "Search" });
  const result = page.locator(".pagefind-ui__result-title").getByRole("link", { name: /The state of the tech industry/ });
  await expect(input).toHaveValue("Orosz");
  await expect(result).toBeVisible({ timeout: 15000 });
  await page.reload();
  await expect(input).toHaveValue("Orosz");
  await expect(result).toBeVisible({ timeout: 15000 });
});

test("Pagefind indexes article text", async ({ page, goto }) => {
  await goto("/search/?q=codemode", { waitUntil: "hydration" });
  const result = page.locator(".pagefind-ui__result-title").getByRole("link", { name: /What is Codemode/ });
  await expect(result).toBeVisible({ timeout: 15000 });
  await expect(result).toHaveAttribute("href", /\/articles\/what-is-codemode$/);
});
