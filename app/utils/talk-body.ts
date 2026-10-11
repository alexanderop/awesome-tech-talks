import { youtubeWatchUrl } from "./talks";

/** A Nuxt Content minimark node: plain text, or `[tag, props, ...children]`. */
export type MinimarkNode = string | [string, Record<string, unknown>, ...MinimarkNode[]];

interface MinimarkBody {
  type: "minimark";
  value: MinimarkNode[];
}

// Nuxt Content types `body` as a HAST-like `MarkdownRoot`, but stores and serves minimark.
function isMinimark(body: object): body is MinimarkBody {
  return "type" in body && body.type === "minimark" && "value" in body && Array.isArray(body.value);
}

const TIMESTAMP = /^((?:\d{1,2}:)?\d{1,2}:\d{2})(\s+)/;

/** `"01:28"` → 88, `"1:02:03"` → 3723. */
export function timestampToSeconds(timestamp: string): number {
  return timestamp.split(":").reduce((total, part) => total * 60 + Number(part), 0);
}

function headingId(node: MinimarkNode): string | undefined {
  if (typeof node === "string" || node[0] !== "h2") return undefined;
  return typeof node[1].id === "string" ? node[1].id : undefined;
}

/** Index range `[start, end)` of the h2 section with this id, or undefined. */
function sectionRange(nodes: readonly MinimarkNode[], id: string): [number, number] | undefined {
  const start = nodes.findIndex(node => headingId(node) === id);
  if (start === -1) return undefined;
  const next = nodes.findIndex((node, index) => index > start && headingId(node) !== undefined);
  return [start, next === -1 ? nodes.length : next];
}

/** Turns `- mm:ss Title` into a link whose `data-seek` the page uses to jump the embed. */
function linkChapter(node: MinimarkNode, youtubeId: string): MinimarkNode {
  if (typeof node === "string" || node[0] !== "li") return node;
  const [tag, props, first, ...rest] = node;
  const match = typeof first === "string" ? TIMESTAMP.exec(first) : null;
  if (!match || typeof first !== "string") return node;
  const [whole, timestamp] = match;
  const seconds = timestampToSeconds(timestamp!);
  const link: MinimarkNode = [
    "a",
    { href: `${youtubeWatchUrl(youtubeId)}&t=${seconds}s`, "data-seek": String(seconds) },
    timestamp!,
  ];
  return [tag, props, link, ` ${first.slice(whole.length)}`, ...rest];
}

/**
 * Reorders a talk body so key takeaways come before the summary, and links
 * every chapter timestamp to that moment of the video.
 */
export function prepareTalkBody<T extends object>(body: T, youtubeId: string): T {
  if (!isMinimark(body)) return body;
  let nodes = [...body.value];

  const takeaways = sectionRange(nodes, "key-takeaways");
  const summary = sectionRange(nodes, "summary");
  if (takeaways && summary && summary[0] < takeaways[0]) {
    const moved = nodes.slice(takeaways[0], takeaways[1]);
    nodes.splice(takeaways[0], moved.length);
    nodes.splice(summary[0], 0, ...moved);
  }

  const chapters = sectionRange(nodes, "chapters");
  if (chapters) {
    nodes = nodes.map((node, index) => {
      if (index <= chapters[0] || index >= chapters[1] || typeof node === "string" || node[0] !== "ul") return node;
      const [tag, props, ...items] = node;
      return [tag, props, ...items.map(item => linkChapter(item, youtubeId))];
    });
  }

  return { ...body, value: nodes };
}
