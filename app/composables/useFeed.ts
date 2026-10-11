import type { CollectedFeed } from "#shared/utils/feed";

/**
 * The collected RSS river. `/api/feed.json` is prerendered at build time, so
 * the payload of every page that asks for it already carries the data and the
 * browser never requests the JSON itself.
 */
export function useFeed() {
  return useFetch<CollectedFeed>("/api/feed.json", { key: "feed", default: () => undefined });
}
