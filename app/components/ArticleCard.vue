<script setup lang="ts">
import type { ArticleItem } from "~/utils/articles";

withDefaults(
  defineProps<{
    article: ArticleItem;
    variant?: "h2" | "h3";
  }>(),
  { variant: "h2" }
);
</script>

<template>
  <li class="border-accent/60 flex flex-col gap-2 border-s-2 ps-4">
    <p class="text-muted-foreground text-xs font-medium tracking-widest uppercase">{{ t.articles.kicker }}</p>
    <NuxtLink
      :to="article.path"
      class="text-accent inline-block text-lg font-medium decoration-dashed underline-offset-4 hover:underline focus-visible:no-underline focus-visible:underline-offset-0"
    >
      <component :is="variant">{{ article.title }}</component>
    </NuxtLink>
    <div class="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      <PeopleLinks :names="article.authors" kind="articles" />
      <span aria-hidden="true">·</span>
      <span>{{ article.site }}</span>
      <span aria-hidden="true">·</span>
      <span>{{ tplStr(t.articles.readingTime, { count: String(article.readingMin) }) }}</span>
      <LevelBadge :level="article.level" />
    </div>
    <p>{{ article.description }}</p>
    <TagLinks :tags="article.tags" kind="articles" />
  </li>
</template>
