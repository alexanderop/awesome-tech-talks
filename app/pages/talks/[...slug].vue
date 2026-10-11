<script setup lang="ts">
import type { Ref } from "vue";
import dayjs from "dayjs";

const route = useRoute();
provide("articleHeadingLinks", true);

const { data } = await useAsyncData(`talk-${route.path}`, () =>
  queryCollection("talks").path(route.path.replace(/\/+$/, "")).first()
);

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
}

const talk = data as Ref<NonNullable<typeof data.value>>;

usePageSeo({
  title: `${talk.value.title} | ${SITE.title}`,
  description: talk.value.description,
  ogImage: youtubeThumbnail(talk.value.youtubeId),
  ogType: "article",
  author: talk.value.speakers.join(", "),
});

useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: talk.value.title,
        description: talk.value.description,
        thumbnailUrl: youtubeThumbnail(talk.value.youtubeId),
        uploadDate: talk.value.publishedAt,
        duration: `PT${talk.value.durationMin}M`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${talk.value.youtubeId}`,
        contentUrl: youtubeWatchUrl(talk.value.youtubeId),
      }),
    },
  ],
});

const publishedOn = computed(() => dayjs(talk.value.publishedAt).format("D MMM, YYYY"));
</script>

<template>
  <BackButton />

  <main id="main-content" data-pagefind-body :class="['app-layout pb-4', { 'mt-8': !FEATURES.showBackButton }]">
    <h1 class="text-accent inline-block text-2xl font-bold sm:text-3xl">
      {{ talk.title }}
    </h1>

    <div class="text-muted-foreground my-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm sm:text-base">
      <PeopleLinks :names="talk.speakers" />
      <span aria-hidden="true">·</span>
      <NuxtLink
        :to="{ path: '/talks', query: { channel: talk.channelId } }"
        class="hover:text-accent underline decoration-dashed underline-offset-4"
      >{{ talk.channel }}</NuxtLink>
      <span aria-hidden="true">·</span>
      <span>{{ talk.conference }}</span>
      <span aria-hidden="true">·</span>
      <time :datetime="talk.publishedAt">{{ publishedOn }}</time>
      <span aria-hidden="true">·</span>
      <span>{{ tplStr(t.talks.minutes, { count: String(talk.durationMin) }) }}</span>
      <LevelBadge :level="talk.level" />
    </div>

    <div class="mt-6" data-pagefind-ignore>
      <YouTubeEmbed :video-id="talk.youtubeId" :title="talk.title" />
    </div>

    <article id="article" class="app-prose max-w-app mt-8 w-full">
      <ContentRenderer :value="talk" />
    </article>

    <section v-if="talk.resources?.length" id="resources" class="mt-8">
      <h2 class="text-xl font-semibold">{{ t.talks.resources }}</h2>
      <ul class="mt-2 list-inside list-disc">
        <li v-for="resource in talk.resources" :key="resource.url">
          <LinkButton
            :href="resource.url"
            class="hover:text-accent underline decoration-dashed underline-offset-4"
          >{{ resource.label }}</LinkButton>
        </li>
      </ul>
    </section>

    <hr class="my-8 border-dashed" />

    <div class="flex flex-wrap items-center justify-between gap-4">
      <TagLinks :tags="talk.tags" />
      <LinkButton :href="youtubeWatchUrl(talk.youtubeId)" class="underline decoration-dashed underline-offset-4">
        {{ t.talks.watchOnYouTube }}
        <IconArrowRight class="inline-block" />
      </LinkButton>
    </div>

    <BackToTop />
  </main>
</template>
