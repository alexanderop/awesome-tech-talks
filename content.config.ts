import { defineCollection, defineContentConfig, z } from "@nuxt/content";

import { contentRoot } from "./build/content-source";

export default defineContentConfig({
  collections: {
    talks: defineCollection({
      type: "page",
      source: {
        cwd: contentRoot,
        include: "talks/**/*.md",
        prefix: "/talks",
      },
      schema: z.object({
        title: z.string(),
        description: z.string(),
        youtubeId: z.string().regex(/^[\w-]{11}$/),
        speakers: z.array(z.string()).min(1),
        conference: z.string(),
        channel: z.string(),
        channelId: z.string().regex(/^UC[\w-]{22}$/),
        publishedAt: z.string(),
        addedAt: z.string(),
        durationMin: z.number().int().positive(),
        level: z.enum(["beginner", "intermediate", "advanced"]),
        tags: z.array(z.string()).min(1),
        resources: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
        featured: z.boolean().optional(),
      }),
    }),
    articles: defineCollection({
      type: "page",
      source: {
        cwd: contentRoot,
        include: "articles/**/*.md",
        prefix: "/articles",
      },
      schema: z.object({
        title: z.string(),
        description: z.string(),
        url: z.string().url(),
        authors: z.array(z.string()).min(1),
        site: z.string(),
        siteUrl: z.string().url(),
        publishedAt: z.string(),
        addedAt: z.string(),
        readingMin: z.number().int().positive(),
        level: z.enum(["beginner", "intermediate", "advanced"]),
        tags: z.array(z.string()).min(1),
        resources: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
        featured: z.boolean().optional(),
      }),
    }),
    pages: defineCollection({
      type: "page",
      source: {
        cwd: contentRoot,
        include: "pages/**/*.md",
        prefix: "/",
      },
      schema: z.object({
        ogImage: z.string().optional(),
        canonicalURL: z.string().optional(),
      }),
    }),
  },
});
