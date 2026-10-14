<script setup lang="ts">
import dayjs from "dayjs";
import type { TweetsCollectionItem } from "@nuxt/content";

withDefaults(
  defineProps<{
    tweet: TweetsCollectionItem;
    variant?: "h2" | "h3";
  }>(),
  { variant: "h2" }
);
</script>

<template>
  <li class="border-accent/60 flex flex-col gap-2 border-s-2 ps-4">
    <p class="text-muted-foreground text-xs font-medium tracking-widest uppercase">{{ t.tweets.kicker }}</p>
    <NuxtLink
      :to="tweet.path"
      class="text-accent inline-block text-lg font-medium decoration-dashed underline-offset-4 hover:underline focus-visible:no-underline focus-visible:underline-offset-0"
    >
      <component :is="variant">{{ tweet.title }}</component>
    </NuxtLink>
    <div class="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      <PeopleLinks :names="[tweet.author]" kind="tweets" />
      <span>@{{ tweet.handle }}</span>
      <span aria-hidden="true">·</span>
      <time :datetime="tweet.publishedAt">{{ dayjs(tweet.publishedAt).format("D MMM, YYYY") }}</time>
    </div>
    <blockquote class="app-prose max-w-app">
      <ContentRenderer :value="tweet" />
    </blockquote>
    <TagLinks :tags="tweet.tags" kind="tweets" />
  </li>
</template>
