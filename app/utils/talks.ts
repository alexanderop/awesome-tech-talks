import { countTags, hasPerson, hasTag, sortByAddedAt, type Level, type Resource, type TagCount } from "#shared/utils/catalog";
import { slugifyStr } from "#shared/utils/routes";

export type TalkLevel = Level;

export type TalkResource = Resource;

export interface TalkItem {
  path: string;
  title: string;
  description: string;
  youtubeId: string;
  speakers: string[];
  conference: string;
  channel: string;
  channelId: string;
  publishedAt: string;
  addedAt: string;
  durationMin: number;
  level: TalkLevel;
  tags: string[];
  featured?: boolean;
}

export interface TalkFilters {
  tag?: string;
  level?: string;
  conference?: string;
  /** Speaker URL slug. */
  speaker?: string;
  /** YouTube channel ID (`UC…`). */
  channel?: string;
}

export interface SourceChannel {
  name: string;
  id: string;
}

export interface TalkChannel extends SourceChannel {
  count: number;
}

export interface TalkSpeaker {
  /** URL slug used in `/talks?speaker=`. */
  slug: string;
  name: string;
  count: number;
  /** Listed in `data/sources.json`. */
  followed: boolean;
}

export const NEW_TALK_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export function youtubeThumbnail(id: string, quality: "hqdefault" | "maxresdefault" = "hqdefault"): string {
  return `https://i.ytimg.com/vi/${id}/${quality}.jpg`;
}

export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
}

export function sortTalksByAddedAt<T extends Pick<TalkItem, "addedAt">>(talks: readonly T[]): T[] {
  return sortByAddedAt(talks);
}

/** True when the talk was added within the 7 days before `now` (ms). */
export function isNewTalk(talk: Pick<TalkItem, "addedAt">, now: number): boolean {
  const age = now - new Date(talk.addedAt).getTime();
  return age >= 0 && age <= NEW_TALK_WINDOW_MS;
}

export function filterTalks<T extends Pick<TalkItem, "tags" | "level" | "conference" | "speakers" | "channelId">>(
  talks: readonly T[],
  filters: TalkFilters
): T[] {
  return talks.filter(
    talk =>
      (!filters.tag || hasTag(talk, filters.tag)) &&
      (!filters.level || talk.level === filters.level) &&
      (!filters.conference || talk.conference === filters.conference) &&
      (!filters.speaker || hasPerson(talk.speakers, filters.speaker)) &&
      (!filters.channel || talk.channelId === filters.channel)
  );
}

/** De-duplicated tag list: `tag` is the URL slug, `tagName` the display label, `count` the talks using it. */
export function getTalkTags(talks: readonly Pick<TalkItem, "tags">[]): TagCount[] {
  return countTags(talks);
}

export function getTalkConferences(talks: readonly Pick<TalkItem, "conference">[]): string[] {
  return [...new Set(talks.map(talk => talk.conference))].toSorted((a, b) => a.localeCompare(b));
}

/**
 * Every followed channel plus any channel that only appears in talks, with the
 * number of talks on the site. Sorted by talk count desc, then name.
 */
export function getTalkChannels(
  talks: readonly Pick<TalkItem, "channel" | "channelId">[],
  followed: readonly SourceChannel[]
): TalkChannel[] {
  const channels = new Map<string, TalkChannel>();
  for (const { id, name } of followed) channels.set(id, { id, name, count: 0 });
  for (const talk of talks) {
    const channel = channels.get(talk.channelId) ?? { id: talk.channelId, name: talk.channel, count: 0 };
    channel.count += 1;
    channels.set(channel.id, channel);
  }
  return [...channels.values()].toSorted((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/**
 * Every speaker from talks plus the followed speakers (kept even with zero
 * talks), keyed by slug. Sorted alphabetically.
 */
export function getTalkSpeakers(
  talks: readonly Pick<TalkItem, "speakers">[],
  followed: readonly string[]
): TalkSpeaker[] {
  const followedSlugs = new Set(followed.map(slugifyStr));
  const speakers = new Map<string, TalkSpeaker>();
  for (const talk of talks) {
    for (const name of talk.speakers) {
      const slug = slugifyStr(name);
      const speaker = speakers.get(slug) ?? { slug, name, count: 0, followed: followedSlugs.has(slug) };
      speaker.count += 1;
      speakers.set(slug, speaker);
    }
  }
  for (const name of followed) {
    const slug = slugifyStr(name);
    if (!speakers.has(slug)) speakers.set(slug, { slug, name, count: 0, followed: true });
  }
  return [...speakers.values()].toSorted((a, b) => a.name.localeCompare(b.name));
}
