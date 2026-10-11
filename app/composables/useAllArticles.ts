import type { ArticleItem } from "~/utils/articles";

/**
 * Fetches all articles (lean fields only, no body), sorted by "added"
 * date descending.
 */
export function useAllArticles() {
  return useAsyncData(
    "all-articles",
    () =>
      queryCollection("articles")
        .select(
          "path",
          "title",
          "description",
          "url",
          "authors",
          "site",
          "siteUrl",
          "publishedAt",
          "addedAt",
          "readingMin",
          "level",
          "tags",
          "featured"
        )
        .all() as Promise<ArticleItem[]>,
    {
      transform: articles => sortArticlesByAddedAt(articles),
      default: () => [] as ArticleItem[],
    }
  );
}
