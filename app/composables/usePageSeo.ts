import { joinURL } from "ufo";

interface PageSeoOptions {
  title?: string;
  description?: string;
  ogImage?: string;
  canonicalURL?: string;
  author?: string;
  ogType?: "website" | "article";
}

export function usePageSeo(options: PageSeoOptions = {}) {
  const route = useRoute();

  const title = options.title ?? SITE.title;
  const description = options.description ?? SITE.description;
  const canonicalURL = options.canonicalURL ?? joinURL(SITE.url, route.path);

  useHead({
    title,
    link: [{ rel: "canonical", href: canonicalURL }],
    meta: SITE.googleVerification
      ? [
          {
            name: "google-site-verification",
            content: SITE.googleVerification,
          },
        ]
      : [],
  });

  useSeoMeta({
    title,
    description,
    author: SITE.author,
    ogType: options.ogType ?? "website",
    ogSiteName: SITE.title,
    ogTitle: title,
    ogDescription: description,
    ogUrl: canonicalURL,
    twitterCard: "summary_large_image",
    twitterTitle: title,
    twitterDescription: description,
  });

  const image = options.ogImage || useRuntimeConfig().public.defaultOgImage;
  const socialImageURL = /^https?:\/\//.test(image) ? image : joinURL(SITE.url, image);
  useSeoMeta({
    ogImage: socialImageURL,
    twitterImage: socialImageURL,
  });
}
