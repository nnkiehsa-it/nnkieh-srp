import { watch } from 'vue';
import { useRoute } from 'vue-router';
import { normalizeIssueRouteFilterParam } from '@/constants/categories';
import { useFilter } from '@/composables/useFilter';

export function useIssueRouteFilter() {
  const route = useRoute();
  const { activeFilter } = useFilter();

  watch(
    () => ['issue-create', 'issue-detail', 'issues'].includes(route.name as string) ? route.params.filter : null,
    (filterParam) => {
      if (filterParam === null) return;

      const nextFilter = normalizeIssueRouteFilterParam(filterParam);
      if (activeFilter.value !== nextFilter) {
        activeFilter.value = nextFilter;
      }
    },
    { immediate: true },
  );

  return {
    activeFilter,
  };
}
