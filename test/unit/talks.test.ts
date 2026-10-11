import { describe, expect, it } from "vitest";
import {
  NEW_TALK_WINDOW_MS,
  filterTalks,
  getTalkChannels,
  getTalkConferences,
  getTalkSpeakers,
  getTalkTags,
  isNewTalk,
  sortTalksByAddedAt,
  youtubeEmbedUrl,
  youtubeThumbnail,
} from "~/utils/talks";

const talks = [
  {
    addedAt: "2025-01-01",
    tags: ["Architecture", "DDD"],
    level: "advanced",
    conference: "B Conf",
    speakers: ["Jane Doe", "Åsa Öberg"],
    channel: "Chan B",
    channelId: "UCbbbbbbbbbbbbbbbbbbbbbb",
  },
  {
    addedAt: "2025-03-01",
    tags: ["vue"],
    level: "beginner",
    conference: "A Conf",
    speakers: ["Gergely Orosz"],
    channel: "Chan A",
    channelId: "UCaaaaaaaaaaaaaaaaaaaaaa",
  },
  {
    addedAt: "2025-02-01",
    tags: ["architecture"],
    level: "advanced",
    conference: "A Conf",
    speakers: ["Jane Doe"],
    channel: "Chan A",
    channelId: "UCaaaaaaaaaaaaaaaaaaaaaa",
  },
] as const;

describe("youtube urls", () => {
  it("builds thumbnail and embed urls", () => {
    expect(youtubeThumbnail("abc")).toBe("https://i.ytimg.com/vi/abc/hqdefault.jpg");
    expect(youtubeThumbnail("abc", "maxresdefault")).toBe("https://i.ytimg.com/vi/abc/maxresdefault.jpg");
    expect(youtubeEmbedUrl("abc")).toBe("https://www.youtube-nocookie.com/embed/abc?autoplay=1");
  });
});

describe("sortTalksByAddedAt", () => {
  it("sorts newest first without mutating the input", () => {
    const sorted = sortTalksByAddedAt(talks);
    expect(sorted.map(talk => talk.addedAt)).toEqual(["2025-03-01", "2025-02-01", "2025-01-01"]);
    expect(talks[0].addedAt).toBe("2025-01-01");
  });
});

describe("isNewTalk", () => {
  const now = new Date("2025-03-10T00:00:00Z").getTime();

  it("is true within seven days and false outside", () => {
    expect(isNewTalk({ addedAt: "2025-03-05" }, now)).toBe(true);
    expect(isNewTalk({ addedAt: "2025-03-02" }, now)).toBe(false);
  });

  it("includes the window boundary and excludes future dates", () => {
    expect(isNewTalk({ addedAt: new Date(now - NEW_TALK_WINDOW_MS).toISOString() }, now)).toBe(true);
    expect(isNewTalk({ addedAt: "2025-03-11" }, now)).toBe(false);
  });
});

describe("filterTalks", () => {
  it("returns everything without filters", () => {
    expect(filterTalks(talks, {})).toHaveLength(3);
  });

  it("filters by tag slug case-insensitively", () => {
    expect(filterTalks(talks, { tag: "architecture" })).toHaveLength(2);
  });

  it("combines filters with AND", () => {
    expect(filterTalks(talks, { tag: "architecture", conference: "A Conf" })).toHaveLength(1);
    expect(filterTalks(talks, { level: "advanced", conference: "B Conf" })).toHaveLength(1);
    expect(filterTalks(talks, { level: "beginner", tag: "ddd" })).toHaveLength(0);
  });

  it("filters by speaker slug", () => {
    expect(filterTalks(talks, { speaker: "jane-doe" })).toHaveLength(2);
    expect(filterTalks(talks, { speaker: "gergely-orosz" })).toHaveLength(1);
    expect(filterTalks(talks, { speaker: "nobody" })).toHaveLength(0);
  });

  it("filters by channel id", () => {
    expect(filterTalks(talks, { channel: "UCaaaaaaaaaaaaaaaaaaaaaa" })).toHaveLength(2);
    expect(filterTalks(talks, { channel: "UCbbbbbbbbbbbbbbbbbbbbbb" })).toHaveLength(1);
  });

  it("combines speaker and channel with the other filters", () => {
    expect(filterTalks(talks, { speaker: "jane-doe", channel: "UCaaaaaaaaaaaaaaaaaaaaaa" })).toHaveLength(1);
    expect(filterTalks(talks, { speaker: "jane-doe", level: "beginner" })).toHaveLength(0);
  });
});

describe("filter options", () => {
  it("de-duplicates tags by slug and sorts them", () => {
    expect(getTalkTags(talks)).toEqual([
      { tag: "architecture", tagName: "Architecture", count: 2 },
      { tag: "ddd", tagName: "DDD", count: 1 },
      { tag: "vue", tagName: "vue", count: 1 },
    ]);
  });

  it("lists unique conferences alphabetically", () => {
    expect(getTalkConferences(talks)).toEqual(["A Conf", "B Conf"]);
  });
});

describe("getTalkChannels", () => {
  const followed = [
    { name: "Chan A", id: "UCaaaaaaaaaaaaaaaaaaaaaa" },
    { name: "Idle", id: "UCzzzzzzzzzzzzzzzzzzzzzz" },
    { name: "Alpha Idle", id: "UCyyyyyyyyyyyyyyyyyyyyyy" },
  ];

  it("counts talks per channel and keeps followed channels with zero talks", () => {
    const channels = getTalkChannels(talks, followed);
    expect(channels.find(channel => channel.id === "UCaaaaaaaaaaaaaaaaaaaaaa")?.count).toBe(2);
    expect(channels.find(channel => channel.id === "UCzzzzzzzzzzzzzzzzzzzzzz")?.count).toBe(0);
  });

  it("merges channels that appear only in talks", () => {
    const channels = getTalkChannels(talks, followed);
    expect(channels.find(channel => channel.id === "UCbbbbbbbbbbbbbbbbbbbbbb")).toEqual({
      id: "UCbbbbbbbbbbbbbbbbbbbbbb",
      name: "Chan B",
      count: 1,
    });
  });

  it("sorts by count descending, then by name", () => {
    expect(getTalkChannels(talks, followed).map(channel => channel.name)).toEqual([
      "Chan A",
      "Chan B",
      "Alpha Idle",
      "Idle",
    ]);
  });

  it("prefers the followed channel name over the name on a talk", () => {
    const [channel] = getTalkChannels(talks, [{ name: "Renamed", id: "UCaaaaaaaaaaaaaaaaaaaaaa" }]);
    expect(channel?.name).toBe("Renamed");
  });
});

describe("getTalkSpeakers", () => {
  it("counts talks per speaker and sorts alphabetically", () => {
    const speakers = getTalkSpeakers(talks, []);
    expect(speakers.map(speaker => [speaker.name, speaker.count])).toEqual([
      ["Åsa Öberg", 1],
      ["Gergely Orosz", 1],
      ["Jane Doe", 2],
    ]);
  });

  it("gives each speaker a URL slug matching the filter", () => {
    const speakers = getTalkSpeakers(talks, []);
    expect(speakers.find(speaker => speaker.name === "Jane Doe")?.slug).toBe("jane-doe");
    const jane = speakers.find(speaker => speaker.name === "Jane Doe")!;
    expect(filterTalks(talks, { speaker: jane.slug })).toHaveLength(2);
    const asa = speakers.find(speaker => speaker.name === "Åsa Öberg")!;
    expect(filterTalks(talks, { speaker: asa.slug })).toHaveLength(1);
  });

  it("adds followed speakers without talks and flags followed ones", () => {
    const speakers = getTalkSpeakers(talks, ["Mario Klaver", "Gergely Orosz"]);
    expect(speakers.find(speaker => speaker.name === "Mario Klaver")).toEqual({
      slug: "mario-klaver",
      name: "Mario Klaver",
      count: 0,
      followed: true,
    });
    expect(speakers.find(speaker => speaker.name === "Gergely Orosz")).toMatchObject({ count: 1, followed: true });
    expect(speakers.find(speaker => speaker.name === "Jane Doe")?.followed).toBe(false);
  });

  it("does not duplicate a followed speaker who already has talks", () => {
    expect(getTalkSpeakers(talks, ["jane doe"]).filter(speaker => speaker.slug === "jane-doe")).toHaveLength(1);
  });
});
