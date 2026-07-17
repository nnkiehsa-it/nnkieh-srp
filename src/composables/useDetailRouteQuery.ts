import { computed } from 'vue';
import { useRoute } from 'vue-router';

export function useDetailRouteQuery() {
  const route = useRoute();
  const initialTab = computed(() => route.query.tab === 'comments' ? 'comments' : 'details');
  const focusCommentId = computed(() => typeof route.query.comment === 'string' ? route.query.comment : '');

  return {
    focusCommentId,
    initialTab,
  };
}
