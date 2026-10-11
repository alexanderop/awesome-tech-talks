<script setup lang="ts">
usePageSeo({ title: `${t.pages.peopleTitle} | ${SITE.title}`, description: t.pages.peopleDesc });
useRememberBackUrl();

const [{ data: talks }, { data: articles }] = await Promise.all([useAllTalks(), useAllArticles()]);
const people = computed(() => getPeople(talks.value, articles.value, followedSpeakers));

function counts(person: Person): string {
  const parts: string[] = [];
  if (person.talkCount > 0) {
    parts.push(person.talkCount === 1 ? t.talks.talkCountOne : tplStr(t.talks.talkCount, { count: String(person.talkCount) }));
  }
  if (person.articleCount > 0) {
    parts.push(
      person.articleCount === 1 ? t.articles.articleCountOne : tplStr(t.articles.articleCount, { count: String(person.articleCount) })
    );
  }
  return parts.join(" · ");
}

const linkClass = "hover:text-accent text-sm underline decoration-dashed underline-offset-4";
</script>

<template>
  <BreadcrumbNav />

  <PageMain :page-title="t.pages.peopleTitle" :page-desc="t.pages.peopleDesc">
    <ul>
      <li
        v-for="person in people"
        :key="person.slug"
        class="border-border flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b py-3 last:border-b-0"
      >
        <div class="flex flex-wrap items-baseline gap-x-3">
          <h2 class="text-lg font-medium">{{ person.name }}</h2>
          <span v-if="person.talkCount + person.articleCount > 0" class="text-muted-foreground text-sm">
            {{ counts(person) }}
          </span>
          <span
            v-else
            class="border-border text-muted-foreground rounded border px-1.5 text-xs"
          >{{ t.talks.followed }} · {{ t.talks.noTalksYet }}</span>
        </div>
        <div class="flex gap-x-4">
          <NuxtLink
            v-if="person.talkCount > 0"
            :to="{ path: '/talks', query: { speaker: person.slug } }"
            :class="linkClass"
          >{{ t.talks.viewTalks }}</NuxtLink>
          <NuxtLink
            v-if="person.articleCount > 0"
            :to="{ path: '/articles', query: { author: person.slug } }"
            :class="linkClass"
          >{{ t.articles.viewArticles }}</NuxtLink>
        </div>
      </li>
    </ul>
  </PageMain>
</template>
