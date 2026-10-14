<script setup lang="ts">
import type { Ref } from "vue";
import dayjs from "dayjs";

const route = useRoute();

const { data } = await useAsyncData(`tweet-${route.path}`, () =>
  queryCollection("tweets").path(route.path.replace(/\/+$/, "")).first()
);

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
}

const tweet = data as Ref<NonNullable<typeof data.value>>;

usePageSeo({
  title: `${tweet.value.title} | ${SITE.title}`,
  description: tweet.value.description,
  ogType: "article",
  author: tweet.value.author,
});

useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SocialMediaPosting",
        headline: tweet.value.title,
        description: tweet.value.description,
        datePublished: tweet.value.publishedAt,
        author: { "@type": "Person", name: tweet.value.author, url: `https://x.com/${tweet.value.handle}` },
        sharedContent: tweet.value.url,
      }),
    },
  ],
});

const publishedOn = computed(() => dayjs(tweet.value.publishedAt).format("D MMM, YYYY"));
</script>

<template>
  <BackButton />

  <main id="main-content" data-pagefind-body :class="['app-layout pb-4', { 'mt-8': !FEATURES.showBackButton }]">
    <h1 class="text-accent inline-block text-2xl font-bold sm:text-3xl">
      {{ tweet.title }}
    </h1>

    <div class="text-muted-foreground my-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm sm:text-base">
      <PeopleLinks :names="[tweet.author]" kind="tweets" />
      <a
        :href="`https://x.com/${tweet.handle}`"
        target="_blank"
        rel="noopener noreferrer"
        class="hover:text-accent underline decoration-dashed underline-offset-4"
      >@{{ tweet.handle }}</a>
      <span aria-hidden="true">·</span>
      <time :datetime="tweet.publishedAt">{{ publishedOn }}</time>
    </div>

    <blockquote id="tweet" class="app-prose max-w-app border-accent/60 mt-8 w-full border-s-2 ps-4">
      <ContentRenderer :value="tweet" />
    </blockquote>

    <hr class="my-8 border-dashed" />

    <div class="flex flex-wrap items-center justify-between gap-4">
      <TagLinks :tags="tweet.tags" kind="tweets" />
      <a
        :href="tweet.url"
        target="_blank"
        rel="noopener noreferrer"
        data-pagefind-ignore
        class="border-accent text-accent hover:bg-accent hover:text-background focus-visible:outline-accent inline-flex items-center gap-1 rounded border px-4 py-2 font-medium"
      >{{ t.tweets.readOriginal }}</a>
    </div>

    <BackToTop />
  </main>
</template>
