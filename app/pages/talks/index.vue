<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

usePageSeo({ title: `${t.pages.talksTitle} | ${SITE.title}`, description: t.pages.talksDesc });
useRememberBackUrl();

const route = useRoute();
const now = useRuntimeConfig().public.buildTime;

const { data: talks } = await useAllTalks();

const { filters, hasFilters, setFilter, clearFilters } = useUrlFilters([
  "tag",
  "level",
  "conference",
  "speaker",
  "channel",
] as const satisfies readonly (keyof TalkFilters)[]);

const tags = computed(() => getTalkTags(talks.value).map(({ tag, tagName }) => ({ value: tag, label: tagName })));
const conferences = computed(() => getTalkConferences(talks.value).map(name => ({ value: name, label: name })));
const speakers = computed(() =>
  getTalkSpeakers(talks.value, [])
    .filter(speaker => speaker.count > 0)
    .map(({ slug, name }) => ({ value: slug, label: name }))
);
const channels = computed(() => getTalkChannels(talks.value, []).map(({ id, name }) => ({ value: id, label: name })));
const levels = computed(() =>
  (Object.keys(t.levels) as TalkLevel[])
    .filter(level => talks.value.some(talk => talk.level === level))
    .map(level => ({ value: level, label: t.levels[level] }))
);

const filteredTalks = computed(() => filterTalks(talks.value, filters.value));
const newTalks = computed(() => talks.value.filter(talk => isNewTalk(talk, now)));

// Speaker and channel filters come from links elsewhere on the site, so they
// get their own indicator with a link that clears just that filter.
const activeSources = computed(() => {
  const items: { key: "speaker" | "channel"; label: string; clearTo: RouteLocationRaw }[] = [];
  for (const key of ["speaker", "channel"] as const) {
    const value = filters.value[key];
    if (!value) continue;
    const name =
      key === "speaker"
        ? (getTalkSpeakers(talks.value, followedSpeakers).find(speaker => speaker.slug === value)?.name ?? value)
        : (getTalkChannels(talks.value, followedChannels).find(channel => channel.id === value)?.name ?? value);
    items.push({
      key,
      label: tplStr(key === "speaker" ? t.talks.filteredBySpeaker : t.talks.filteredByChannel, { name }),
      clearTo: { path: "/talks", query: { ...route.query, [key]: undefined } },
    });
  }
  return items;
});
</script>

<template>
  <BreadcrumbNav />

  <PageMain :page-title="t.pages.talksTitle" :page-desc="t.pages.talksDesc">
    <section v-if="newTalks.length > 0 && !hasFilters" id="new-this-week" class="border-border mb-8 border-b pb-8">
      <h2 class="text-2xl font-semibold tracking-wide">{{ t.talks.newThisWeek }}</h2>
      <ul class="mt-4 grid gap-8 sm:grid-cols-2">
        <TalkCard v-for="talk in newTalks" :key="talk.path" :talk="talk" variant="h3" />
      </ul>
    </section>

    <section id="all-talks">
      <h2 class="text-2xl font-semibold tracking-wide">{{ t.talks.allTalks }}</h2>

      <form class="mt-4 flex flex-wrap items-end gap-4" role="search" @submit.prevent>
        <FilterSelect
          id="filter-tag"
          :label="t.talks.filterTag"
          :any-label="t.talks.filterAny"
          :value="filters.tag ?? ''"
          :options="tags"
          @change="setFilter('tag', $event)"
        />
        <FilterSelect
          id="filter-level"
          :label="t.talks.filterLevel"
          :any-label="t.talks.filterAny"
          :value="filters.level ?? ''"
          :options="levels"
          @change="setFilter('level', $event)"
        />
        <FilterSelect
          id="filter-conference"
          :label="t.talks.filterConference"
          :any-label="t.talks.filterAny"
          :value="filters.conference ?? ''"
          :options="conferences"
          @change="setFilter('conference', $event)"
        />
        <FilterSelect
          id="filter-speaker"
          :label="t.talks.filterSpeaker"
          :any-label="t.talks.filterAny"
          :value="filters.speaker ?? ''"
          :options="speakers"
          @change="setFilter('speaker', $event)"
        />
        <FilterSelect
          id="filter-channel"
          :label="t.talks.filterChannel"
          :any-label="t.talks.filterAny"
          :value="filters.channel ?? ''"
          :options="channels"
          @change="setFilter('channel', $event)"
        />
        <button
          v-if="hasFilters"
          type="button"
          class="hover:text-accent text-sm underline decoration-dashed underline-offset-4"
          @click="clearFilters"
        >
          {{ t.talks.clearFilters }}
        </button>
      </form>

      <ul v-if="activeSources.length > 0" id="active-filters" class="mt-4 flex flex-wrap gap-x-4 gap-y-1">
        <li v-for="item in activeSources" :key="item.key" class="text-accent flex items-baseline gap-2">
          <span class="font-medium">{{ item.label }}</span>
          <NuxtLink
            :to="item.clearTo"
            class="text-foreground hover:text-accent text-sm underline decoration-dashed underline-offset-4"
          >{{ t.talks.clear }}</NuxtLink>
        </li>
      </ul>

      <p class="text-muted-foreground mt-4 text-sm" aria-live="polite">
        {{ tplStr(t.talks.resultsCount, { count: String(filteredTalks.length), total: String(talks.length) }) }}
      </p>

      <ul v-if="filteredTalks.length > 0" class="mt-4 grid gap-8 sm:grid-cols-2">
        <TalkCard v-for="talk in filteredTalks" :key="talk.path" :talk="talk" variant="h3" />
      </ul>
      <p v-else class="mt-8">{{ t.talks.noResults }}</p>
    </section>
  </PageMain>
</template>
