<script setup lang="ts">
import { joinURL } from "ufo";

const TALKS_PER_INDEX = 6;
const ARTICLES_PER_INDEX = 5;
const FEED_PER_INDEX = 5;
const TAGS_PER_INDEX = 16;

usePageSeo();
useRememberBackUrl();

const rssHref = joinURL(useRuntimeConfig().app.baseURL, "rss.xml");

const [{ data: talks }, { data: articles }, { data: feed }] = await Promise.all([useAllTalks(), useAllArticles(), useFeed()]);

const latestFeed = computed(() => (feed.value?.items ?? []).slice(0, FEED_PER_INDEX));
const featuredTalks = computed(() => talks.value.filter(talk => talk.featured));
const latestTalks = computed(() => talks.value.slice(0, TALKS_PER_INDEX));
const latestArticles = computed(() => articles.value.slice(0, ARTICLES_PER_INDEX));
// Each pill links to the list where the tag is most used and shows that list's count.
const topTags = computed(() =>
  countSiteTags(talks.value, articles.value)
    .toSorted((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, TAGS_PER_INDEX)
    .map(({ tag, tagName, talkCount, articleCount }) =>
      talkCount >= articleCount
        ? { tag, tagName, kind: "talks" as const, count: talkCount }
        : { tag, tagName, kind: "articles" as const, count: articleCount }
    )
);

function countLabel(count: number, one: string, many: string) {
  return count === 1 ? one : tplStr(many, { count: String(count) });
}

const stats = computed(() => [
  { to: "/talks", label: countLabel(talks.value.length, t.home.statTalk, t.home.statTalks) },
  { to: "/articles", label: countLabel(articles.value.length, t.home.statArticle, t.home.statArticles) },
  {
    to: "/channels",
    label: countLabel(getTalkChannels(talks.value, followedChannels).length, t.home.statChannel, t.home.statChannels),
  },
  {
    to: "/people",
    label: countLabel(getPeople(talks.value, articles.value, followedSpeakers).length, t.home.statPerson, t.home.statPeople),
  },
]);
</script>

<template>
  <main id="main-content" class="app-layout my-1">
    <section id="hero" class="border-border border-b pt-8 pb-6">
      <h1 class="my-4 inline-block text-4xl font-bold sm:my-8 sm:text-5xl">
        {{ HOME.title }}
      </h1>
      <a
        target="_blank"
        :href="rssHref"
        class="inline-block"
        aria-label="RSS Feed"
        title="RSS Feed"
      >
        <IconRss
          width="20"
          height="20"
          class="stroke-accent scale-125 stroke-3 rtl:-rotate-90"
        />
        <span class="sr-only">RSS Feed</span>
      </a>

      <p>{{ HOME.pitch }}</p>
      <ul id="stats" class="text-muted-foreground mt-4 flex flex-wrap items-center gap-x-2 gap-y-1">
        <template v-for="(stat, index) in stats" :key="stat.to">
          <li v-if="index > 0" aria-hidden="true">·</li>
          <li>
            <NuxtLink
              :to="stat.to"
              class="hover:text-accent underline decoration-dashed underline-offset-4"
            >{{ stat.label }}</NuxtLink>
          </li>
        </template>
      </ul>
    </section>

    <section
      v-if="featuredTalks.length > 0"
      id="featured"
      :class="[
        'pt-12 pb-6',
        { 'border-border border-b': latestTalks.length > 0 },
      ]"
    >
      <h2 class="text-2xl font-semibold tracking-wide">
        {{ t.home.featuredTalks }}
      </h2>
      <ul class="mt-4 grid gap-8 sm:grid-cols-2">
        <TalkCard
          v-for="talk in featuredTalks"
          :key="talk.path"
          :talk="talk"
          variant="h3"
        />
      </ul>
    </section>

    <section v-if="latestTalks.length > 0" id="latest-talks" class="pt-12 pb-6">
      <h2 class="text-2xl font-semibold tracking-wide">
        {{ t.home.latestTalks }}
      </h2>
      <ul class="mt-4 grid gap-8 sm:grid-cols-2">
        <TalkCard
          v-for="talk in latestTalks"
          :key="talk.path"
          :talk="talk"
          variant="h3"
        />
      </ul>
      <div class="mt-8 text-center">
        <LinkButton href="/talks">
          {{ t.home.allTalks }}
          <IconArrowRight class="inline-block rtl:-rotate-180" />
        </LinkButton>
      </div>
    </section>

    <section v-if="latestArticles.length > 0" id="latest-articles" class="border-border border-t pt-12 pb-6">
      <h2 class="text-2xl font-semibold tracking-wide">
        {{ t.home.latestArticles }}
      </h2>
      <ul class="mt-4 flex flex-col gap-8">
        <ArticleCard
          v-for="article in latestArticles"
          :key="article.path"
          :article="article"
          variant="h3"
        />
      </ul>
      <div class="mt-8 text-center">
        <LinkButton href="/articles">
          {{ t.home.allArticles }}
          <IconArrowRight class="inline-block rtl:-rotate-180" />
        </LinkButton>
      </div>
    </section>

    <section v-if="latestFeed.length > 0" id="from-the-feed" class="border-border border-t pt-8 pb-6">
      <div class="flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 class="text-lg font-semibold tracking-wide">
          {{ t.home.fromTheFeed }}
        </h2>
        <NuxtLink
          to="/feed"
          class="hover:text-accent text-sm underline decoration-dashed underline-offset-4"
        >{{ t.home.fullFeed }} →</NuxtLink>
      </div>
      <ul class="mt-3">
        <li v-for="item in latestFeed" :key="item.url" class="py-1">
          <a
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-accent decoration-dashed underline-offset-4 hover:underline"
          >{{ item.title }}</a>
          <span class="text-muted-foreground text-sm">
            <span aria-hidden="true"> · </span>{{ item.source }}<template v-if="item.date"><span aria-hidden="true"> · </span>{{ formatDayKey(dayKey(item.date)) }}</template>
          </span>
        </li>
      </ul>
    </section>

    <section v-if="topTags.length > 0" id="browse-by-tag" class="border-border mb-4 border-t pt-8 pb-6">
      <h2 class="text-2xl font-semibold tracking-wide">
        {{ t.home.browseByTag }}
      </h2>
      <ul class="mt-4 flex flex-wrap gap-x-6 gap-y-3">
        <TagPill
          v-for="{ tag, tagName, count, kind } in topTags"
          :key="tag"
          :tag="tag"
          :tag-name="tagName"
          :count="count"
          :kind="kind"
          size="sm"
        />
      </ul>
    </section>
  </main>
</template>
