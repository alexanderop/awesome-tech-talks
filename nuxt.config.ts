import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { joinURL } from "ufo";
import { SITE } from "./shared/utils/site";

const rendererVersion = createHash("sha256")
  .update(readFileSync(new URL("./app/mdc.config.ts", import.meta.url)))
  .update(readFileSync(new URL("./build/rehype-svg.mjs", import.meta.url)))
  .digest("hex");
const baseURL = process.env.NUXT_APP_BASE_URL || "/";
// Inline FOUC-prevention script: sets data-theme on <html> before the
// browser paints. Mirrors AstroPaper's inline theme script.
const themeInitScript = `
(function () {
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = stored ?? (prefersDark ? "dark" : "light");
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.classList.toggle("dark", theme === "dark");
})();
`;

export default defineNuxtConfig({
  // `buildTime` anchors the "new this week" window for prerendered pages.
  runtimeConfig: { public: { buildTime: Number(process.env.NUXT_BUILD_TIME) || Date.now(), defaultOgImage: SITE.ogImage } },
  compatibilityDate: "2026-06-10",
  devtools: { enabled: true },
  modules: ["@nuxt/content", "@nuxt/fonts"],

  css: ["@pagefind/default-ui/css/ui.css", "~/assets/css/fonts.css", "~/assets/css/global.css", "katex/dist/katex.min.css"],

  postcss: { plugins: { cssnano: false } },

  vite: {
    plugins: [tailwindcss()],
  },

  components: [
    { path: "~/components/content", pathPrefix: false, global: true },
    { path: "~/components", pathPrefix: false },
  ],

  experimental: {
    viewTransition: true,
  },

  app: {
    head: {
      htmlAttrs: {
        lang: SITE.lang,
        dir: SITE.dir,
        class: "overflow-y-scroll scroll-smooth",
      },
      link: [
        {
          rel: "icon",
          type: "image/svg+xml",
          href: joinURL(baseURL, "favicon.svg"),
        },
        { rel: "sitemap", href: joinURL(baseURL, "sitemap.xml") },
        {
          rel: "alternate",
          type: "application/rss+xml",
          title: SITE.title,
          href: joinURL(baseURL, "rss.xml"),
        },
      ],
      meta: [{ name: "theme-color", content: "" }],
      script: [{ innerHTML: themeInitScript }],
    },
  },

  fonts: {
    families: [{ name: "Google Sans Code", provider: "none" }],
  },

  content: {
    build: {
      markdown: {
        remarkPlugins: {
          "remark-toc": {},
          "remark-smartypants": {},
          "remark-math": {},
          "remark-collapse": { options: { test: "Table of contents" } },
        },
        rehypePlugins: {
          "rehype-callouts": { options: { theme: "obsidian" } },
          "rehype-katex": {},
          // Content hashes plugin options, but not the custom transformer files.
          [fileURLToPath(new URL("./build/rehype-svg.mjs", import.meta.url))]: { options: { rendererVersion } },
        },
        highlight: {
          theme: {
            default: "min-light",
            dark: "night-owl",
          },
        },
      },
    },
  },

  nitro: {
    prerender: {
      // /speakers is a redirect to /people for old links.
      routes: ["/rss.xml", "/sitemap.xml", "/robots.txt", "/speakers", "/api/feed.json"],
    },
  },
});
