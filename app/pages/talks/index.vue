<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

usePageSeo({ title: `${t.pages.talksTitle} | ${SITE.title}`, description: t.pages.talksDesc });
useRememberBackUrl();

const route = useRoute();
const now = useRuntimeConfig().public.buildTime;

const { data: talks } = await useAllTalks();

const TAG_CHIP_LIMIT = 8;

const { filters, hasFilters, setFilter, clearFilters } = useUrlFilters([
  "q",
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
// Skip the "new" section when it would mostly repeat the full list right below it.
const showNewTalks = computed(() => newTalks.value.length > 0 && newTalks.value.length * 2 <= talks.value.length);

const topTags = computed(() =>
  getTalkTags(talks.value)
    .toSorted((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, TAG_CHIP_LIMIT)
    .map(({ tag, tagName }) => ({ value: tag, label: tagName }))
);

// Rarer filters live behind "More filters"; open it when one of them is set.
const moreFiltersActive = computed(
  () =>
    Boolean(filters.value.conference || filters.value.speaker || filters.value.channel) ||
    Boolean(filters.value.tag && !topTags.value.some(tag => tag.value === filters.value.tag))
);

// The input keeps its own text so typing isn't interrupted by the URL round trip.
const search = ref("");
watch(
  () => filters.value.q ?? "",
  q => {
    if (q !== search.value.trim()) search.value = q;
  },
  { immediate: true }
);
watch(search, value => {
  if (value.trim() !== (filters.value.q ?? "")) setFilter("q", value.trim());
});

function toggleFilter(key: "tag" | "level", value: string) {
  setFilter(key, filters.value[key] === value ? "" : value);
}

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
    <section v-if="showNewTalks && !hasFilters" id="new-this-week" class="border-border mb-8 border-b pb-8">
      <h2 class="text-2xl font-semibold tracking-wide">{{ t.talks.newThisWeek }}</h2>
      <ul class="mt-4 grid gap-8 sm:grid-cols-2">
        <TalkCard v-for="talk in newTalks" :key="talk.path" :talk="talk" variant="h3" />
      </ul>
    </section>

    <section id="all-talks">
      <h2 class="text-2xl font-semibold tracking-wide">{{ t.talks.allTalks }}</h2>

      <form class="mt-4 flex flex-col gap-3" role="search" @submit.prevent>
        <label class="flex flex-col gap-1 text-sm">
          <span class="sr-only">{{ t.talks.filterSearch }}</span>
          <input
            id="filter-q"
            v-model="search"
            type="search"
            :placeholder="t.talks.filterSearchPlaceholder"
            class="border-border bg-background text-foreground focus-visible:outline-accent w-full rounded border px-3 py-2 text-base"
          />
        </label>

        <div v-if="levels.length > 1" class="flex flex-wrap items-center gap-2" role="group" :aria-label="t.talks.filterLevel">
          <span class="text-muted-foreground me-1 text-sm">{{ t.talks.filterLevel }}</span>
          <button
            v-for="level in levels"
            :key="level.value"
            type="button"
            :aria-pressed="filters.level === level.value"
            :class="['filter-chip', { 'filter-chip-on': filters.level === level.value }]"
            @click="toggleFilter('level', level.value)"
          >{{ level.label }}</button>
        </div>

        <div class="flex flex-wrap items-center gap-2" role="group" :aria-label="t.talks.filterTag">
          <span class="text-muted-foreground me-1 text-sm">{{ t.talks.filterTag }}</span>
          <button
            v-for="tag in topTags"
            :key="tag.value"
            type="button"
            :aria-pressed="filters.tag === tag.value"
            :class="['filter-chip', { 'filter-chip-on': filters.tag === tag.value }]"
            @click="toggleFilter('tag', tag.value)"
          >#{{ tag.label }}</button>
        </div>

        <details id="more-filters" :open="moreFiltersActive" class="text-sm">
          <summary class="hover:text-accent w-fit cursor-pointer">{{ t.talks.moreFilters }}</summary>
          <div class="mt-3 flex flex-wrap items-end gap-4">
            <FilterSelect
              id="filter-tag"
              :label="t.talks.filterTag"
              :any-label="t.talks.filterAny"
              :value="filters.tag ?? ''"
              :options="tags"
              @change="setFilter('tag', $event)"
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
          </div>
        </details>

        <button
          v-if="hasFilters"
          type="button"
          class="hover:text-accent w-fit text-sm underline decoration-dashed underline-offset-4"
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

<style scoped>
.filter-chip {
  border: 1px solid var(--color-border);
  border-radius: 9999px;
  padding: 0.125rem 0.75rem;
  font-size: 0.875rem;
}

.filter-chip:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.filter-chip-on {
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: var(--color-accent-foreground);
}

.filter-chip-on:hover {
  color: var(--color-accent-foreground);
}
</style>
