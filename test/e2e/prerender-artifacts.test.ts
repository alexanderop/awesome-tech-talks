import { expect, test } from "./test-utils";

test.describe("prerender artifacts", () => {
  test("GET /rss.xml is valid XML with at least one item", async ({
    request,
  }) => {
    const res = await request.get("/rss.xml");
    expect(res.status()).toBe(200);

    const body = await res.text();
    // Well-formed XML: declaration, rss root, and at least one item.
    expect(body).toMatch(/^<\?xml\s/);
    expect(body).toContain("<rss");
    expect(body).toMatch(/<item>/);
    expect(body).toContain("/articles/what-is-codemode</link>");
    expect(body).toContain("/talks/state-of-the-tech-industry-2026</link>");
  });

  test("GET /sitemap.xml is valid XML with at least one url", async ({
    request,
  }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);

    const body = await res.text();
    expect(body).toMatch(/^<\?xml\s/);
    expect(body).toContain("<urlset");
    expect(body).toMatch(/<url>/);
    expect(body).toContain("/articles</loc>");
    expect(body).toContain("/articles/what-is-codemode</loc>");
    expect(body).toContain("/people</loc>");
  });
});
