/**
 * Fetches all tweets with their body (the list shows the full text, and tweets
 * are short), sorted by "added" date descending.
 */
export function useAllTweets() {
  return useAsyncData("all-tweets", () => queryCollection("tweets").all(), {
    transform: tweets => sortTweetsByAddedAt(tweets),
    default: () => [],
  });
}
