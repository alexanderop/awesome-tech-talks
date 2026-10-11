<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    tags: string[];
    /** Which list each tag filters. */
    kind?: "talks" | "articles";
    /** Show at most this many tags, then a `+N` count. */
    limit?: number;
    /** Muted text without the dashed underline, for dense card lists. */
    quiet?: boolean;
  }>(),
  { kind: "talks", limit: Infinity, quiet: false }
);

const shown = computed(() => props.tags.slice(0, props.limit));
const hiddenCount = computed(() => props.tags.length - shown.value.length);
</script>

<template>
  <ul :class="['flex flex-wrap', quiet ? 'gap-x-2.5 gap-y-1' : 'gap-x-3 gap-y-1']">
    <li v-for="tag in shown" :key="tag">
      <NuxtLink
        :to="{ path: `/${kind}`, query: { tag: slugifyStr(tag) } }"
        :class="[
          'hover:text-accent focus-visible:text-accent flex items-center text-sm',
          quiet
            ? 'text-muted-foreground'
            : 'hover:border-accent border-foreground gap-0.5 border-b-2 border-dashed',
        ]"
      >
        <IconHash :class="quiet ? 'size-3.5 opacity-70' : 'size-4 opacity-80'" />
        {{ tag }}
      </NuxtLink>
    </li>
    <li v-if="hiddenCount > 0" class="text-muted-foreground text-sm">
      <span aria-hidden="true">+{{ hiddenCount }}</span>
      <span class="sr-only">{{ tplStr(t.tags.moreTags, { count: String(hiddenCount) }) }}</span>
    </li>
  </ul>
</template>
