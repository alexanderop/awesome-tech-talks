import { countTags, hasPerson, hasTag, sortByAddedAt, type Level, type Resource, type TagCount } from "#shared/utils/catalog";
import { slugifyStr } from "#shared/utils/routes";

export type ArticleLevel = Level;

export type ArticleResource = Resource;

export interface ArticleItem {
  /** Local page, `/articles/<slug>`. */
  path: string;
  title: string;
  description: string;
  /** The original post on the author's site. */
  url: string;
  authors: string[];
  /** Blog or publication name. */
  site: string;
  siteUrl: string;
  publishedAt: string;
  addedAt: string;
  readingMin: number;
  level: ArticleLevel;
  tags: string[];
  featured?: boolean;
}

export interface ArticleFilters {
  tag?: string;
  level?: string;
  /** Author URL slug. */
  author?: string;
}

export interface ArticleAuthor {
  /** URL slug used in `/articles?author=`. */
  slug: string;
  name: string;
  count: number;
}

export function sortArticlesByAddedAt<T extends Pick<ArticleItem, "addedAt">>(articles: readonly T[]): T[] {
  return sortByAddedAt(articles);
}

export function filterArticles<T extends Pick<ArticleItem, "tags" | "level" | "authors">>(
  articles: readonly T[],
  filters: ArticleFilters
): T[] {
  return articles.filter(
    article =>
      (!filters.tag || hasTag(article, filters.tag)) &&
      (!filters.level || article.level === filters.level) &&
      (!filters.author || hasPerson(article.authors, filters.author))
  );
}

export function getArticleTags(articles: readonly Pick<ArticleItem, "tags">[]): TagCount[] {
  return countTags(articles);
}

/** Every author with the number of articles on the site, sorted alphabetically. */
export function getArticleAuthors(articles: readonly Pick<ArticleItem, "authors">[]): ArticleAuthor[] {
  const authors = new Map<string, ArticleAuthor>();
  for (const article of articles) {
    for (const name of article.authors) {
      const slug = slugifyStr(name);
      const author = authors.get(slug) ?? { slug, name, count: 0 };
      author.count += 1;
      authors.set(slug, author);
    }
  }
  return [...authors.values()].toSorted((a, b) => a.name.localeCompare(b.name));
}
