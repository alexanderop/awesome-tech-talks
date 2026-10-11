<script setup lang="ts">
import type { Level } from "#shared/utils/catalog";

defineProps<{ level: Level }>();
</script>

<template>
  <span class="border-border rounded border px-1.5 text-xs">{{ t.levels[level] }}</span>
</template>
