<script setup lang="ts">
withDefaults(
  defineProps<{
    tags: string[];
    /** Which list each tag filters. */
    kind?: "talks" | "articles";
  }>(),
  { kind: "talks" }
);
</script>

<template>
  <ul class="flex flex-wrap gap-x-3 gap-y-1">
    <li v-for="tag in tags" :key="tag">
      <NuxtLink
        :to="{ path: `/${kind}`, query: { tag: slugifyStr(tag) } }"
        class="hover:text-accent hover:border-accent focus-visible:text-accent border-foreground flex items-center gap-0.5 border-b-2 border-dashed text-sm"
      >
        <IconHash class="size-4 opacity-80" />
        {{ tag }}
      </NuxtLink>
    </li>
  </ul>
</template>
