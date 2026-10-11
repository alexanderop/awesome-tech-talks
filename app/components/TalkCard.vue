<script setup lang="ts">
import type { TalkItem } from "~/utils/talks";

withDefaults(
  defineProps<{
    talk: TalkItem;
    variant?: "h2" | "h3";
  }>(),
  { variant: "h2" }
);
</script>

<template>
  <li class="flex flex-col gap-2">
    <NuxtLink :to="talk.path" tabindex="-1" aria-hidden="true" class="block">
      <img
        :src="youtubeThumbnail(talk.youtubeId)"
        :alt="tplStr(t.talks.thumbnailAlt, { title: talk.title })"
        loading="lazy"
        width="480"
        height="360"
        class="border-border aspect-video w-full rounded border object-cover"
      />
    </NuxtLink>
    <NuxtLink
      :to="talk.path"
      class="text-accent inline-block text-lg font-medium decoration-dashed underline-offset-4 hover:underline focus-visible:no-underline focus-visible:underline-offset-0"
    >
      <component :is="variant">{{ talk.title }}</component>
    </NuxtLink>
    <div class="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      <PeopleLinks :names="talk.speakers" />
      <span aria-hidden="true">·</span>
      <span>{{ talk.conference }}</span>
      <span aria-hidden="true">·</span>
      <span>{{ tplStr(t.talks.minutes, { count: String(talk.durationMin) }) }}</span>
      <LevelBadge :level="talk.level" />
    </div>
    <p>{{ talk.description }}</p>
    <TagLinks :tags="talk.tags" />
  </li>
</template>
