import { describe, expect, it } from "vitest";
import { prepareTalkBody, timestampToSeconds, type MinimarkNode } from "~/utils/talk-body";

function body(...value: MinimarkNode[]) {
  return { type: "minimark" as const, value, toc: {} };
}

const summary: MinimarkNode[] = [["h2", { id: "summary" }, "Summary"], ["p", {}, "Context."]];
const takeaways: MinimarkNode[] = [["h2", { id: "key-takeaways" }, "Key takeaways"], ["ul", {}, ["li", {}, "Point"]]];
const chapters: MinimarkNode[] = [
  ["h2", { id: "chapters" }, "Chapters"],
  ["ul", {}, ["li", {}, "00:06 Intro"], ["li", {}, "1:02:03 Long talk"], ["li", {}, "No timestamp"]],
];

describe("timestampToSeconds", () => {
  it("parses mm:ss and h:mm:ss", () => {
    expect(timestampToSeconds("01:28")).toBe(88);
    expect(timestampToSeconds("1:02:03")).toBe(3723);
  });
});

describe("prepareTalkBody", () => {
  it("moves key takeaways before the summary", () => {
    const result = prepareTalkBody(body(...summary, ...takeaways, ...chapters), "abcdefghijk");
    const ids = result.value.filter(node => typeof node !== "string" && node[0] === "h2").map(node => (node as [string, { id: string }])[1].id);
    expect(ids).toEqual(["key-takeaways", "summary", "chapters"]);
    expect(result.toc).toEqual({});
  });

  it("links chapter timestamps to that moment of the video", () => {
    const result = prepareTalkBody(body(...chapters), "abcdefghijk");
    const [, , ...items] = result.value[1] as [string, object, ...MinimarkNode[]];
    expect(items[0]).toEqual([
      "li",
      {},
      ["a", { href: "https://www.youtube.com/watch?v=abcdefghijk&t=6s", "data-seek": "6" }, "00:06"],
      " Intro",
    ]);
    expect((items[1] as MinimarkNode[])[2]).toEqual([
      "a",
      { href: "https://www.youtube.com/watch?v=abcdefghijk&t=3723s", "data-seek": "3723" },
      "1:02:03",
    ]);
    expect(items[2]).toEqual(["li", {}, "No timestamp"]);
  });

  it("leaves lists outside the chapters section alone", () => {
    const list: MinimarkNode = ["ul", {}, ["li", {}, "00:06 Not a chapter"]];
    const result = prepareTalkBody(body(["h2", { id: "summary" }, "Summary"], list), "abcdefghijk");
    expect(result.value[1]).toEqual(list);
  });

  it("returns non-minimark bodies unchanged", () => {
    const root = { type: "root", children: [] };
    expect(prepareTalkBody(root, "abcdefghijk")).toBe(root);
  });
});
