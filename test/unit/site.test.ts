import { describe, expect, it } from "vitest";
import {
  FEATURES,
  SITE,
  SOCIALS,
  type SocialLink,
} from "#shared/utils/site";

describe("SITE", () => {
  it("has a non-empty https url", () => {
    expect(SITE.url).toMatch(/^https:\/\/.+/);
  });

  it("has a non-empty title and timezone", () => {
    expect(SITE.title.length).toBeGreaterThan(0);
    expect(SITE.timezone.length).toBeGreaterThan(0);
  });
});

describe("FEATURES", () => {
  it("exposes boolean toggles", () => {
    expect(typeof FEATURES.search).toBe("boolean");
    expect(typeof FEATURES.lightAndDarkMode).toBe("boolean");
  });
});

describe("SOCIALS", () => {
  const links: SocialLink[] = SOCIALS;

  it("is a non-empty list", () => {
    expect(links.length).toBeGreaterThan(0);
  });

  it("every entry has a non-empty name and url", () => {
    for (const link of links) {
      expect(link.name.length).toBeGreaterThan(0);
      expect(link.url.length).toBeGreaterThan(0);
    }
  });
});
