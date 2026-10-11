import { describe, expect, it } from "vitest";
import { filterArticles, getArticleAuthors, getArticleTags, sortArticlesByAddedAt } from "~/utils/articles";

const articles = [
  { addedAt: "2025-01-01", tags: ["MCP", "AI"], level: "advanced", authors: ["Armin Ronacher"] },
  { addedAt: "2025-03-01", tags: ["ai"], level: "beginner", authors: ["Ann Author", "Armin Ronacher"] },
  { addedAt: "2025-02-01", tags: ["testing"], level: "advanced", authors: ["Åsa Öberg"] },
] as const;

describe("sortArticlesByAddedAt", () => {
  it("sorts newest first", () => {
    expect(sortArticlesByAddedAt(articles).map(article => article.addedAt)).toEqual([
      "2025-03-01",
      "2025-02-01",
      "2025-01-01",
    ]);
  });
});

describe("filterArticles", () => {
  it("returns everything without filters", () => {
    expect(filterArticles(articles, {})).toHaveLength(3);
  });

  it("filters by tag slug case-insensitively", () => {
    expect(filterArticles(articles, { tag: "ai" })).toHaveLength(2);
  });

  it("filters by level", () => {
    expect(filterArticles(articles, { level: "advanced" })).toHaveLength(2);
  });

  it("filters by author slug, including non-ASCII names", () => {
    expect(filterArticles(articles, { author: "armin-ronacher" })).toHaveLength(2);
    expect(filterArticles(articles, { author: "nobody" })).toHaveLength(0);
    const [asa] = getArticleAuthors([articles[2]]);
    expect(filterArticles(articles, { author: asa!.slug })).toHaveLength(1);
  });

  it("combines filters with AND", () => {
    expect(filterArticles(articles, { tag: "ai", level: "advanced" })).toHaveLength(1);
    expect(filterArticles(articles, { tag: "ai", level: "beginner", author: "armin-ronacher" })).toHaveLength(1);
    expect(filterArticles(articles, { tag: "testing", level: "beginner" })).toHaveLength(0);
  });
});

describe("getArticleTags", () => {
  it("de-duplicates tags by slug and counts articles", () => {
    expect(getArticleTags(articles)).toEqual([
      { tag: "ai", tagName: "AI", count: 2 },
      { tag: "mcp", tagName: "MCP", count: 1 },
      { tag: "testing", tagName: "testing", count: 1 },
    ]);
  });
});

describe("getArticleAuthors", () => {
  it("counts articles per author and sorts alphabetically", () => {
    expect(getArticleAuthors(articles).map(author => [author.name, author.count])).toEqual([
      ["Ann Author", 1],
      ["Armin Ronacher", 2],
      ["Åsa Öberg", 1],
    ]);
  });

  it("gives each author the slug used by the filter", () => {
    expect(getArticleAuthors(articles).find(author => author.name === "Armin Ronacher")?.slug).toBe("armin-ronacher");
  });
});
