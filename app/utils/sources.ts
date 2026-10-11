import sources from "~~/data/sources.json";
import type { SourceChannel } from "~/utils/talks";

/** Channels and speakers followed for discovery (`data/sources.json`). */
export const followedChannels: SourceChannel[] = sources.channels;
export const followedSpeakers: string[] = sources.speakers;
