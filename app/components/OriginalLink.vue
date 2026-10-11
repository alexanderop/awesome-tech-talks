<script setup lang="ts">
defineProps<{ url: string; site: string }>();
</script>

<template>
  <a
    :href="url"
    target="_blank"
    rel="noopener noreferrer"
    class="border-accent text-accent hover:bg-accent hover:text-background focus-visible:outline-accent inline-flex items-center gap-1 rounded border px-4 py-2 font-medium"
  >{{ tplStr(t.articles.readOriginal, { site }) }}</a>
</template>
