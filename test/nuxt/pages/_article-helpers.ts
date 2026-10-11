import type { ArticleItem } from "~/utils/articles";

/**
 * Builds an ArticleItem for tests, with sensible defaults that can be overridden.
 */
export function makeArticle(overrides: Partial<ArticleItem> = {}): ArticleItem {
  return {
    path: "/articles/example",
    title: "Example Article",
    description: "An example article description.",
    url: "https://blog.example.com/2025/example/",
    authors: ["Ann Author"],
    site: "Example Blog",
    siteUrl: "https://blog.example.com",
    publishedAt: "2025-01-15",
    addedAt: "2025-01-20",
    readingMin: 8,
    level: "intermediate",
    tags: ["architecture"],
    featured: false,
    ...overrides,
  };
}
