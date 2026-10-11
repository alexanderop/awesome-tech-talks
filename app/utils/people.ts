import { slugifyStr } from "#shared/utils/routes";
import type { ArticleItem } from "~/utils/articles";
import type { TalkItem } from "~/utils/talks";

export interface Person {
  /** URL slug used in `/talks?speaker=` and `/articles?author=`. */
  slug: string;
  name: string;
  talkCount: number;
  articleCount: number;
  /** Listed in `data/sources.json`. */
  followed: boolean;
}

/**
 * Every speaker and article author, plus the followed speakers (kept even
 * with no content yet), keyed by name slug. Sorted alphabetically.
 */
export function getPeople(
  talks: readonly Pick<TalkItem, "speakers">[],
  articles: readonly Pick<ArticleItem, "authors">[],
  followed: readonly string[]
): Person[] {
  const followedSlugs = new Set(followed.map(slugifyStr));
  const people = new Map<string, Person>();
  const entry = (name: string): Person => {
    const slug = slugifyStr(name);
    const person = people.get(slug) ?? { slug, name, talkCount: 0, articleCount: 0, followed: followedSlugs.has(slug) };
    people.set(slug, person);
    return person;
  };
  for (const talk of talks) for (const name of talk.speakers) entry(name).talkCount += 1;
  for (const article of articles) for (const name of article.authors) entry(name).articleCount += 1;
  for (const name of followed) entry(name);
  return [...people.values()].toSorted((a, b) => a.name.localeCompare(b.name));
}
