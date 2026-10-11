import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";

const origin = process.argv[2] || "http://localhost:5681";
const base = "/awesome-tech-talks";
const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(`${origin}${base}/search?q=Orosz`);
  const result = page.locator(".pagefind-ui__result-title").getByRole("link", { name: /The state of the tech industry/ });
  await expect(result).toBeVisible();
  const searchURL = new URL(page.url());
  assert.ok([`${base}/search`, `${base}/search/`].includes(searchURL.pathname));
  assert.equal(searchURL.search, "?q=Orosz");
  await expect(result).toHaveAttribute("href", `${base}/talks/state-of-the-tech-industry-2026`);
  await result.click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("The state of the tech industry");
  const back = page.getByRole("link", { name: "Go back", exact: true });
  await expect(back).toHaveAttribute("href", `${searchURL.pathname}${searchURL.search}`);
  await back.click();
  await expect(page).toHaveURL(searchURL.href);
  await expect(page.getByRole("textbox", { name: "Search" })).toHaveValue("Orosz");
  await expect(result).toBeVisible();
  const robots = await page.request.get(`${origin}${base}/robots.txt`);
  assert.equal(robots.status(), 200);
  assert.match(await robots.text(), /Sitemap: https:\/\/alexanderop.github.io\/awesome-tech-talks\/sitemap.xml/);
  const sitemap = await page.request.get(`${origin}${base}/sitemap.xml`);
  assert.match(await sitemap.text(), /https:\/\/alexanderop.github.io\/awesome-tech-talks\/talks\/state-of-the-tech-industry-2026/);
  assert.deepEqual(errors, []);
  console.log("Actual Chrome subpath search, talk page, return query, robots and sitemap passed.");
} finally {
  await browser.close();
}
