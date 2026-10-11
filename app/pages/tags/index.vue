<script setup lang="ts">
usePageSeo({ title: `${t.pages.tagsTitle} | ${SITE.title}`, description: t.pages.tagsDesc });
useRememberBackUrl();

const [{ data: talks }, { data: articles }] = await Promise.all([useAllTalks(), useAllArticles()]);
const tags = computed(() => countSiteTags(talks.value, articles.value));

const linkClass = "hover:text-accent underline decoration-dashed underline-offset-4";
</script>

<template>
  <BreadcrumbNav />

  <PageMain :page-title="t.pages.tagsTitle" :page-desc="t.pages.tagsDesc">
    <ul class="flex flex-wrap gap-x-8 gap-y-4">
      <li v-for="{ tag, tagName, talkCount, articleCount } in tags" :key="tag" class="flex flex-col">
        <span class="flex items-center gap-0.5 text-lg">
          <IconHash class="size-5 opacity-80" />
          {{ tagName }}
        </span>
        <span class="text-muted-foreground flex gap-x-3 text-sm">
          <NuxtLink v-if="talkCount > 0" :to="{ path: '/talks', query: { tag } }" :class="linkClass">{{
            talkCount === 1 ? t.talks.talkCountOne : tplStr(t.talks.talkCount, { count: String(talkCount) })
          }}</NuxtLink>
          <NuxtLink v-if="articleCount > 0" :to="{ path: '/articles', query: { tag } }" :class="linkClass">{{
            articleCount === 1 ? t.articles.articleCountOne : tplStr(t.articles.articleCount, { count: String(articleCount) })
          }}</NuxtLink>
        </span>
      </li>
    </ul>
  </PageMain>
</template>
