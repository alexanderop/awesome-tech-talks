import { countTags, hasPerson, hasTag, sortByAddedAt, type TagCount } from "#shared/utils/catalog";

export interface TweetItem {
  /** Local page, `/tweets/<slug>`. */
  path: string;
  title: string;
  description: string;
  /** The original post on X. */
  url: string;
  author: string;
  /** X handle without the `@`. */
  handle: string;
  publishedAt: string;
  addedAt: string;
  tags: string[];
  featured?: boolean;
}

export interface TweetFilters {
  tag?: string;
  /** Author URL slug. */
  author?: string;
}

export function sortTweetsByAddedAt<T extends Pick<TweetItem, "addedAt">>(tweets: readonly T[]): T[] {
  return sortByAddedAt(tweets);
}

export function filterTweets<T extends Pick<TweetItem, "tags" | "author">>(tweets: readonly T[], filters: TweetFilters): T[] {
  return tweets.filter(
    tweet => (!filters.tag || hasTag(tweet, filters.tag)) && (!filters.author || hasPerson([tweet.author], filters.author))
  );
}

export function getTweetTags(tweets: readonly Pick<TweetItem, "tags">[]): TagCount[] {
  return countTags(tweets);
}
