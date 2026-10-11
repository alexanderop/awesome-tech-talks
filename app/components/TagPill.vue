<script setup lang="ts">
withDefaults(
  defineProps<{
    tag: string;
    tagName: string;
    count?: number;
    size?: "sm" | "lg";
    /** List the pill filters. */
    kind?: "talks" | "articles";
  }>(),
  { size: "lg", count: undefined, kind: "talks" }
);
</script>

<template>
  <li>
    <NuxtLink
      :to="{ path: `/${kind}`, query: { tag } }"
      :class="[
        'flex items-center gap-0.5',
        'border-foreground border-b-2 border-dashed',
        'hover:border-accent hover:text-accent hover:-mt-0.5',
        'focus-visible:text-accent focus-visible:border-none',
        size === 'sm' ? 'text-sm' : 'text-lg',
      ]"
    >
      <IconHash
        :class="['opacity-80', size === 'lg' ? 'size-5' : 'size-4']"
      />
      {{ tagName }}
      <span v-if="count !== undefined" class="text-muted-foreground ms-1 text-sm">{{ count }}</span>
    </NuxtLink>
  </li>
</template>
