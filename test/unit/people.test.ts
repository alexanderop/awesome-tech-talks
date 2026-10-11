import { describe, expect, it } from "vitest";
import { getPeople } from "~/utils/people";

const talks = [{ speakers: ["Jane Doe", "Gergely Orosz"] }, { speakers: ["Jane Doe"] }];
const articles = [{ authors: ["Armin Ronacher"] }, { authors: ["Jane Doe"] }];

describe("getPeople", () => {
  it("merges speakers and authors by name slug with separate counts", () => {
    const people = getPeople(talks, articles, []);
    expect(people.map(person => [person.name, person.talkCount, person.articleCount])).toEqual([
      ["Armin Ronacher", 0, 1],
      ["Gergely Orosz", 1, 0],
      ["Jane Doe", 2, 1],
    ]);
  });

  it("flags followed people and keeps those without any content", () => {
    const people = getPeople(talks, articles, ["Mario Klaver", "gergely orosz"]);
    expect(people.find(person => person.name === "Mario Klaver")).toEqual({
      slug: "mario-klaver",
      name: "Mario Klaver",
      talkCount: 0,
      articleCount: 0,
      followed: true,
    });
    expect(people.find(person => person.name === "Gergely Orosz")?.followed).toBe(true);
    expect(people.find(person => person.name === "Jane Doe")?.followed).toBe(false);
    expect(people.filter(person => person.slug === "gergely-orosz")).toHaveLength(1);
  });

  it("works with no content at all", () => {
    expect(getPeople([], [], [])).toEqual([]);
  });
});
