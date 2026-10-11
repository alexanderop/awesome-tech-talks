/**
 * Filter state kept in the URL query (`?tag=…&level=…`) for the list pages.
 *
 * The pages are prerendered, so the HTML always lists everything. Applying
 * the query only after mount keeps hydration consistent.
 */
export function useUrlFilters<K extends string>(keys: readonly K[]) {
  const route = useRoute();
  const router = useRouter();

  const mounted = ref(false);
  onMounted(() => {
    mounted.value = true;
  });

  function queryValue(key: K): string {
    const value = route.query[key];
    return (Array.isArray(value) ? value[0] : value) ?? "";
  }

  const filters = computed(() => {
    const result: Partial<Record<K, string>> = {};
    if (mounted.value) for (const key of keys) result[key] = queryValue(key);
    return result;
  });

  const hasFilters = computed(() => Object.values(filters.value).some(Boolean));

  function setFilter(key: K, value: string) {
    router.replace({ query: { ...route.query, [key]: value || undefined } });
  }

  function clearFilters() {
    router.replace({ query: {} });
  }

  return { filters, hasFilters, setFilter, clearFilters };
}
