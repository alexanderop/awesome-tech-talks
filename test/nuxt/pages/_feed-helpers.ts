import type { CollectedFeed, FeedItem, FeedStatus } from "#shared/utils/feed";

export function makeFeedItem(overrides: Partial<FeedItem> = {}): FeedItem {
  return {
    title: "Example post",
    url: "https://blog.example.com/example-post",
    date: "2026-10-11T08:00:00.000Z",
    source: "Example Blog",
    sourceUrl: "https://blog.example.com",
    ...overrides,
  };
}

export function makeFeedStatus(overrides: Partial<FeedStatus> = {}): FeedStatus {
  return {
    name: "Example Blog",
    url: "https://blog.example.com",
    feed: "https://blog.example.com/feed.xml",
    ok: true,
    ...overrides,
  };
}

export function makeFeed(overrides: Partial<CollectedFeed> = {}): CollectedFeed {
  return { generatedAt: "2026-10-11T10:00:00.000Z", sources: [makeFeedStatus()], items: [makeFeedItem()], ...overrides };
}
