import { describe, expect, it } from "vitest";
import { countSiteTags, countTags, hasPerson, hasTag, sortByAddedAt } from "#shared/utils/catalog";

describe("sortByAddedAt", () => {
  it("sorts newest first without mutating the input", () => {
    const items = [{ addedAt: "2025-01-01" }, { addedAt: "2025-03-01" }, { addedAt: "2025-02-01" }];
    expect(sortByAddedAt(items).map(item => item.addedAt)).toEqual(["2025-03-01", "2025-02-01", "2025-01-01"]);
    expect(items[0]?.addedAt).toBe("2025-01-01");
  });
});

describe("hasTag and hasPerson", () => {
  it("match on the URL slug, ignoring case and spacing in the source value", () => {
    expect(hasTag({ tags: ["Domain Driven Design"] }, "domain-driven-design")).toBe(true);
    expect(hasTag({ tags: ["vue"] }, "nuxt")).toBe(false);
    expect(hasPerson(["Jane Doe", "Åsa Öberg"], "jane-doe")).toBe(true);
    expect(hasPerson(["Jane Doe"], "john-roe")).toBe(false);
  });
});

describe("countTags", () => {
  it("counts each item once per tag, de-duplicating by slug", () => {
    expect(countTags([{ tags: ["Vue", "vue"] }, { tags: ["VUE", "Nuxt"] }])).toEqual([
      { tag: "nuxt", tagName: "Nuxt", count: 1 },
      { tag: "vue", tagName: "Vue", count: 2 },
    ]);
  });
});

describe("countSiteTags", () => {
  const talks = [{ tags: ["AI", "Vue"] }, { tags: ["ai"] }];
  const articles = [{ tags: ["ai", "MCP"] }];

  it("splits the total into talk and article counts", () => {
    expect(countSiteTags(talks, articles)).toEqual([
      { tag: "ai", tagName: "AI", count: 3, talkCount: 2, articleCount: 1 },
      { tag: "mcp", tagName: "MCP", count: 1, talkCount: 0, articleCount: 1 },
      { tag: "vue", tagName: "Vue", count: 1, talkCount: 1, articleCount: 0 },
    ]);
  });

  it("works when one side is empty", () => {
    expect(countSiteTags([], articles).map(tag => tag.talkCount)).toEqual([0, 0]);
    expect(countSiteTags(talks, [])).toHaveLength(2);
  });
});
