<script setup lang="ts">
withDefaults(
  defineProps<{
    names: string[];
    /** Which list each name filters: talk speakers or article authors. */
    kind?: "talks" | "articles" | "tweets";
  }>(),
  { kind: "talks" }
);
</script>

<template>
  <span>
    <template v-for="(name, index) in names" :key="name">
      <template v-if="index > 0">, </template>
      <NuxtLink
        :to="{ path: `/${kind}`, query: { [kind === 'talks' ? 'speaker' : 'author']: slugifyStr(name) } }"
        class="hover:text-accent underline decoration-dashed underline-offset-4"
      >{{ name }}</NuxtLink>
    </template>
  </span>
</template>
