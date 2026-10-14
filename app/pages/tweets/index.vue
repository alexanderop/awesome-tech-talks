<script setup lang="ts">
usePageSeo({ title: `${t.pages.tweetsTitle} | ${SITE.title}`, description: t.pages.tweetsDesc });
useRememberBackUrl();

const route = useRoute();

const { data: tweets } = await useAllTweets();

const { filters, hasFilters, setFilter, clearFilters } = useUrlFilters([
  "tag",
  "author",
] as const satisfies readonly (keyof TweetFilters)[]);

const tags = computed(() => getTweetTags(tweets.value).map(({ tag, tagName }) => ({ value: tag, label: tagName })));
const authors = computed(() =>
  [...new Map(tweets.value.map(tweet => [slugifyStr(tweet.author), tweet.author])).entries()]
    .map(([value, label]) => ({ value, label }))
    .toSorted((a, b) => a.label.localeCompare(b.label))
);

const filteredTweets = computed(() => filterTweets(tweets.value, filters.value));

const activeAuthor = computed(() => {
  const value = filters.value.author;
  if (!value) return undefined;
  const name = authors.value.find(author => author.value === value)?.label ?? value;
  return {
    label: tplStr(t.tweets.filteredByAuthor, { name }),
    clearTo: { path: "/tweets", query: { ...route.query, author: undefined } },
  };
});
</script>

<template>
  <BreadcrumbNav />

  <PageMain :page-title="t.pages.tweetsTitle" :page-desc="t.pages.tweetsDesc">
    <section id="all-tweets">
      <h2 class="text-2xl font-semibold tracking-wide">{{ t.tweets.allTweets }}</h2>

      <form class="mt-4 flex flex-wrap items-end gap-4" role="search" @submit.prevent>
        <FilterSelect
          id="filter-tag"
          :label="t.tweets.filterTag"
          :any-label="t.tweets.filterAny"
          :value="filters.tag ?? ''"
          :options="tags"
          @change="setFilter('tag', $event)"
        />
        <FilterSelect
          id="filter-author"
          :label="t.tweets.filterAuthor"
          :any-label="t.tweets.filterAny"
          :value="filters.author ?? ''"
          :options="authors"
          @change="setFilter('author', $event)"
        />
        <button
          v-if="hasFilters"
          type="button"
          class="hover:text-accent text-sm underline decoration-dashed underline-offset-4"
          @click="clearFilters"
        >
          {{ t.tweets.clearFilters }}
        </button>
      </form>

      <ul v-if="activeAuthor" id="active-filters" class="mt-4 flex flex-wrap gap-x-4 gap-y-1">
        <li class="text-accent flex items-baseline gap-2">
          <span class="font-medium">{{ activeAuthor.label }}</span>
          <NuxtLink
            :to="activeAuthor.clearTo"
            class="text-foreground hover:text-accent text-sm underline decoration-dashed underline-offset-4"
          >{{ t.tweets.clear }}</NuxtLink>
        </li>
      </ul>

      <p class="text-muted-foreground mt-4 text-sm" aria-live="polite">
        {{ tplStr(t.tweets.resultsCount, { count: String(filteredTweets.length), total: String(tweets.length) }) }}
      </p>

      <ul v-if="filteredTweets.length > 0" class="mt-4 flex flex-col gap-8">
        <TweetCard v-for="tweet in filteredTweets" :key="tweet.path" :tweet="tweet" variant="h3" />
      </ul>
      <p v-else class="mt-8">{{ t.tweets.noResults }}</p>
    </section>
  </PageMain>
</template>
