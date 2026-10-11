import { resolve } from "node:path";

export const contentRoot = resolve(process.env.NUXT_CONTENT_ROOT || "content");
