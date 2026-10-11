<script setup lang="ts">
import type { TalkItem } from "~/utils/talks";

const CARD_TAG_LIMIT = 3;

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
    <div class="relative">
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
      <span class="pointer-events-none absolute bottom-2 left-2 rounded bg-black/75 px-1.5 py-0.5 text-xs text-white">
        {{ t.levels[talk.level] }}
      </span>
      <span class="pointer-events-none absolute right-2 bottom-2 rounded bg-black/75 px-1.5 py-0.5 text-xs text-white">
        {{ tplStr(t.talks.minutes, { count: String(talk.durationMin) }) }}
      </span>
    </div>
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
    </div>
    <p class="line-clamp-2">{{ talk.description }}</p>
    <TagLinks :tags="talk.tags" :limit="CARD_TAG_LIMIT" quiet />
  </li>
</template>
