<script setup lang="ts">
const route = useRoute();

const navLabels: Record<string, string> = {
  talks: t.nav.talks,
  articles: t.nav.articles,
  channels: t.nav.channels,
  people: t.nav.people,
  tags: t.nav.tags,
  about: t.nav.about,
  search: t.nav.search,
};

function decodeSegment(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function breadcrumbSegments(path: string) {
  return path.replace(/\/+$/, "").split("/").slice(1).filter(Boolean);
}

const crumbs = computed(() =>
  breadcrumbSegments(route.path).map((segment, index, list) => ({
    label: navLabels[segment] ?? decodeSegment(segment),
    href: `/${segment}`,
    isCurrent: index === list.length - 1,
    lowercase: index > 0,
  }))
);
</script>

<template>
  <nav class="app-layout mt-8 mb-1" aria-label="breadcrumb">
    <ul
      class="flex flex-wrap items-center gap-x-1 font-light [&>li:not(:last-child)>a]:hover:opacity-100"
    >
      <li class="flex items-center gap-x-1">
        <NuxtLink to="/" class="opacity-80">{{ t.nav.home }}</NuxtLink>
        <span aria-hidden="true" class="opacity-80">&raquo;</span>
      </li>
      <li v-for="(crumb, index) in crumbs" :key="index" :class="{ 'flex items-center gap-x-1': !crumb.isCurrent }">
        <span
          v-if="crumb.isCurrent"
          :class="['capitalize opacity-75', { lowercase: crumb.lowercase }]"
          aria-current="page"
        >
          {{ crumb.label }}
        </span>
        <template v-else>
          <NuxtLink :to="crumb.href" class="capitalize opacity-70">
            {{ crumb.label }}
          </NuxtLink>
          <span aria-hidden="true" class="opacity-70">&raquo;</span>
        </template>
      </li>
    </ul>
  </nav>
</template>
