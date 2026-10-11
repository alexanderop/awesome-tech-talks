<script setup lang="ts">
usePageSeo({ title: `${t.pages.articlesTitle} | ${SITE.title}`, description: t.pages.articlesDesc });
useRememberBackUrl();

const route = useRoute();

const { data: articles } = await useAllArticles();

const { filters, hasFilters, setFilter, clearFilters } = useUrlFilters([
  "tag",
  "level",
  "author",
] as const satisfies readonly (keyof ArticleFilters)[]);

const tags = computed(() => getArticleTags(articles.value).map(({ tag, tagName }) => ({ value: tag, label: tagName })));
const authors = computed(() => getArticleAuthors(articles.value).map(({ slug, name }) => ({ value: slug, label: name })));
const levels = computed(() =>
  (Object.keys(t.levels) as ArticleLevel[])
    .filter(level => articles.value.some(article => article.level === level))
    .map(level => ({ value: level, label: t.levels[level] }))
);

const filteredArticles = computed(() => filterArticles(articles.value, filters.value));

// The author filter comes from links elsewhere on the site, so it gets its own
// indicator with a link that clears just that filter.
const activeAuthor = computed(() => {
  const value = filters.value.author;
  if (!value) return undefined;
  const name = authors.value.find(author => author.value === value)?.label ?? value;
  return {
    label: tplStr(t.articles.filteredByAuthor, { name }),
    clearTo: { path: "/articles", query: { ...route.query, author: undefined } },
  };
});
</script>

<template>
  <BreadcrumbNav />

  <PageMain :page-title="t.pages.articlesTitle" :page-desc="t.pages.articlesDesc">
    <section id="all-articles">
      <h2 class="text-2xl font-semibold tracking-wide">{{ t.articles.allArticles }}</h2>

      <form class="mt-4 flex flex-wrap items-end gap-4" role="search" @submit.prevent>
        <FilterSelect
          id="filter-tag"
          :label="t.articles.filterTag"
          :any-label="t.articles.filterAny"
          :value="filters.tag ?? ''"
          :options="tags"
          @change="setFilter('tag', $event)"
        />
        <FilterSelect
          id="filter-level"
          :label="t.articles.filterLevel"
          :any-label="t.articles.filterAny"
          :value="filters.level ?? ''"
          :options="levels"
          @change="setFilter('level', $event)"
        />
        <FilterSelect
          id="filter-author"
          :label="t.articles.filterAuthor"
          :any-label="t.articles.filterAny"
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
          {{ t.articles.clearFilters }}
        </button>
      </form>

      <ul v-if="activeAuthor" id="active-filters" class="mt-4 flex flex-wrap gap-x-4 gap-y-1">
        <li class="text-accent flex items-baseline gap-2">
          <span class="font-medium">{{ activeAuthor.label }}</span>
          <NuxtLink
            :to="activeAuthor.clearTo"
            class="text-foreground hover:text-accent text-sm underline decoration-dashed underline-offset-4"
          >{{ t.articles.clear }}</NuxtLink>
        </li>
      </ul>

      <p class="text-muted-foreground mt-4 text-sm" aria-live="polite">
        {{ tplStr(t.articles.resultsCount, { count: String(filteredArticles.length), total: String(articles.length) }) }}
      </p>

      <ul v-if="filteredArticles.length > 0" class="mt-4 flex flex-col gap-8">
        <ArticleCard v-for="article in filteredArticles" :key="article.path" :article="article" variant="h3" />
      </ul>
      <p v-else class="mt-8">{{ t.articles.noResults }}</p>
    </section>
  </PageMain>
</template>
