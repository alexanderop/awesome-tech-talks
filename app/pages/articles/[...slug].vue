<script setup lang="ts">
import type { Ref } from "vue";
import dayjs from "dayjs";

const route = useRoute();
provide("articleHeadingLinks", true);

const { data } = await useAsyncData(`article-${route.path}`, () =>
  queryCollection("articles").path(route.path.replace(/\/+$/, "")).first()
);

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
}

const article = data as Ref<NonNullable<typeof data.value>>;

usePageSeo({
  title: `${article.value.title} | ${SITE.title}`,
  description: article.value.description,
  ogType: "article",
  author: article.value.authors.join(", "),
});

useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.value.title,
        description: article.value.description,
        datePublished: article.value.publishedAt,
        author: article.value.authors.map(name => ({ "@type": "Person", name })),
        isBasedOn: article.value.url,
      }),
    },
  ],
});

const publishedOn = computed(() => dayjs(article.value.publishedAt).format("D MMM, YYYY"));
</script>

<template>
  <BackButton />

  <main id="main-content" data-pagefind-body :class="['app-layout pb-4', { 'mt-8': !FEATURES.showBackButton }]">
    <h1 class="text-accent inline-block text-2xl font-bold sm:text-3xl">
      {{ article.title }}
    </h1>

    <div class="text-muted-foreground my-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm sm:text-base">
      <PeopleLinks :names="article.authors" kind="articles" />
      <span aria-hidden="true">·</span>
      <a
        :href="article.siteUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="hover:text-accent underline decoration-dashed underline-offset-4"
      >{{ article.site }}</a>
      <span aria-hidden="true">·</span>
      <time :datetime="article.publishedAt">{{ publishedOn }}</time>
      <span aria-hidden="true">·</span>
      <span>{{ tplStr(t.articles.readingTime, { count: String(article.readingMin) }) }}</span>
      <LevelBadge :level="article.level" />
    </div>

    <div class="mt-6" data-pagefind-ignore>
      <OriginalLink :url="article.url" :site="article.site" />
    </div>

    <article id="article" class="app-prose max-w-app mt-8 w-full">
      <ContentRenderer :value="article" />
    </article>

    <section v-if="article.resources?.length" id="resources" class="mt-8">
      <h2 class="text-xl font-semibold">{{ t.articles.resources }}</h2>
      <ul class="mt-2 list-inside list-disc">
        <li v-for="resource in article.resources" :key="resource.url">
          <LinkButton
            :href="resource.url"
            class="hover:text-accent underline decoration-dashed underline-offset-4"
          >{{ resource.label }}</LinkButton>
        </li>
      </ul>
    </section>

    <hr class="my-8 border-dashed" />

    <div class="flex flex-wrap items-center justify-between gap-4">
      <TagLinks :tags="article.tags" kind="articles" />
      <div data-pagefind-ignore>
        <OriginalLink :url="article.url" :site="article.site" />
      </div>
    </div>

    <BackToTop />
  </main>
</template>
