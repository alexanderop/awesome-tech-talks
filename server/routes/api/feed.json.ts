import snapshot from "../../../data/feed-snapshot.json";

// The snapshot is committed by the refresh-feed workflow (scripts/refresh-feed.mjs),
// so builds and the dev server never fetch external feeds.
export default defineEventHandler((): CollectedFeed => snapshot);
