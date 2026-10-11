import type { TalkItem } from "~/utils/talks";

/**
 * Builds a TalkItem for tests, with sensible defaults that can be overridden.
 */
export function makeTalk(overrides: Partial<TalkItem> = {}): TalkItem {
  return {
    path: "/talks/example",
    title: "Example Talk",
    description: "An example talk description.",
    youtubeId: "dQw4w9WgXcQ",
    speakers: ["Jane Doe"],
    conference: "Example Conf",
    channel: "Example Channel",
    channelId: "UCexampleexampleexample00",
    publishedAt: "2025-01-15",
    addedAt: "2025-01-20",
    durationMin: 42,
    level: "intermediate",
    tags: ["architecture"],
    featured: false,
    ...overrides,
  };
}
