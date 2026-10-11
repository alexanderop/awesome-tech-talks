<script setup lang="ts">
defineProps<{
  id: string;
  label: string;
  /** Label of the empty "no filter" option. */
  anyLabel: string;
  value: string;
  options: { value: string; label: string }[];
}>();

const emit = defineEmits<{ change: [value: string] }>();
</script>

<template>
  <label class="flex flex-col gap-1 text-sm">
    {{ label }}
    <select
      :id="id"
      :value="value"
      class="border-border bg-background text-foreground focus-visible:outline-accent rounded border px-2 py-1"
      @change="emit('change', ($event.target as HTMLSelectElement).value)"
    >
      <option value="">{{ anyLabel }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
  </label>
</template>
