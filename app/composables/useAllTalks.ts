import type { TalkItem } from "~/utils/talks";

/**
 * Fetches all talks (lean fields only, no body), sorted by "added"
 * date descending.
 */
export function useAllTalks() {
  return useAsyncData(
    "all-talks",
    () =>
      queryCollection("talks")
        .select(
          "path",
          "title",
          "description",
          "youtubeId",
          "speakers",
          "conference",
          "channel",
          "channelId",
          "publishedAt",
          "addedAt",
          "durationMin",
          "level",
          "tags",
          "featured"
        )
        .all() as Promise<TalkItem[]>,
    {
      transform: talks => sortTalksByAddedAt(talks),
      default: () => [] as TalkItem[],
    }
  );
}
