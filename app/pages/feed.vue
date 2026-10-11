<script setup lang="ts">
usePageSeo({ title: `${t.pages.feedTitle} | ${SITE.title}`, description: t.pages.feedDesc });

const { data: feed } = await useFeed();

const items = computed(() => feed.value?.items ?? []);
const sources = computed(() => feed.value?.sources ?? []);
const failedSources = computed(() => sources.value.filter(source => !source.ok));

// "Today" and "Updated ... ago" depend on the clock. The prerendered HTML is
// measured against the moment the feed was collected; the browser switches to
// the real time after mount so hydration stays consistent.
const now = ref(feed.value ? Date.parse(feed.value.generatedAt) : 0);
onMounted(() => {
  now.value = Date.now();
});

const { filters, hasFilters, setFilter, clearFilters } = useUrlFilters(["source"] as const satisfies readonly (keyof FeedFilters)[]);

const sourceOptions = computed(() =>
  getFeedSources(items.value).map(({ slug, name, count }) => ({ value: slug, label: `${name} (${count})` }))
);
const filteredItems = computed(() => filterFeedItems(items.value, filters.value));
const days = computed(() => groupFeedByDay(filteredItems.value, now.value));
const updatedAgo = computed(() => (feed.value ? formatRelativeTime(feed.value.generatedAt, now.value) : ""));

const linkClass = "hover:text-accent underline decoration-dashed underline-offset-4";
</script>

<template>
  <BreadcrumbNav />

  <PageMain :page-title="t.pages.feedTitle" :page-desc="t.pages.feedDesc">
    <p v-if="feed" id="feed-updated" class="text-muted-foreground -mt-4 mb-6 text-sm">
      {{ t.feed.updated }}
      <time :datetime="feed.generatedAt" :title="feed.generatedAt">{{ updatedAgo }}</time>
    </p>

    <template v-if="items.length > 0">
      <form class="flex flex-wrap items-end gap-4" role="search" @submit.prevent>
        <FilterSelect
          id="filter-source"
          :label="t.feed.filterSource"
          :any-label="t.feed.filterAny"
          :value="filters.source ?? ''"
          :options="sourceOptions"
          @change="setFilter('source', $event)"
        />
        <button v-if="hasFilters" type="button" :class="['text-sm', linkClass]" @click="clearFilters">
          {{ t.feed.clearFilters }}
        </button>
      </form>

      <p class="text-muted-foreground mt-4 text-sm" aria-live="polite">
        {{ tplStr(t.feed.resultsCount, { count: String(filteredItems.length), total: String(items.length) }) }}
      </p>

      <div v-if="days.length > 0" id="feed-river">
        <section v-for="day in days" :key="day.key" class="mt-6" :aria-labelledby="`feed-day-${day.key}`">
          <h2
            :id="`feed-day-${day.key}`"
            class="text-muted-foreground border-border border-b pb-1 text-sm font-semibold tracking-wider uppercase"
          >
            {{ day.label }}
          </h2>
          <ul>
            <li v-for="item in day.items" :key="item.url" class="flex items-baseline gap-x-3 py-1.5">
              <time
                v-if="hasClockTime(item)"
                :datetime="item.date"
                class="text-muted-foreground w-11 shrink-0 text-sm tabular-nums"
              >{{ formatClock(item.date) }}</time>
              <span v-else class="w-11 shrink-0" aria-hidden="true" />
              <p class="min-w-0">
                <a
                  :href="item.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-accent font-medium decoration-dashed underline-offset-4 hover:underline"
                >{{ item.title }}</a>
                <span class="text-muted-foreground text-sm">
                  <span aria-hidden="true"> · </span>
                  <a :href="item.sourceUrl" target="_blank" rel="noopener noreferrer" :class="linkClass">{{ item.source }}</a>
                </span>
              </p>
            </li>
          </ul>
        </section>
      </div>
      <p v-else class="mt-8">{{ t.feed.noResults }}</p>
    </template>
    <p v-else id="feed-empty" class="mt-8">{{ t.feed.empty }}</p>

    <details v-if="sources.length > 0" id="feed-sources" class="border-border mt-12 border-t pt-4">
      <summary class="cursor-pointer text-sm font-medium">
        {{ t.feed.sources }}
        <span class="text-muted-foreground font-normal">
          ({{ sources.length }}<template v-if="failedSources.length > 0">,
            <span aria-hidden="true">⚠ </span>{{ tplStr(t.feed.sourcesFailed, { count: String(failedSources.length) }) }}</template>)
        </span>
      </summary>
      <ul class="mt-3">
        <li v-for="source in sources" :key="source.feed" class="flex flex-wrap items-baseline gap-x-3 py-1 text-sm">
          <a :href="source.url" target="_blank" rel="noopener noreferrer" :class="linkClass">{{ source.name }}</a>
          <a :href="source.feed" target="_blank" rel="noopener noreferrer" :class="['text-muted-foreground', linkClass]">{{ t.feed.feedLink }}</a>
          <span v-if="!source.ok" class="text-muted-foreground" :title="source.error">
            <span aria-hidden="true">⚠</span>
            <span class="sr-only">{{ t.feed.failedMarker }}</span>
            <template v-if="source.error"> {{ source.error }}</template>
          </span>
        </li>
      </ul>
    </details>
  </PageMain>
</template>
