import { computed, onScopeDispose, ref, watch, type Ref } from 'vue';
import { useNetworkStatus } from '@/composables/useNetworkStatus';

export function useLoadingTimeout(loading: Ref<boolean>, timeoutMs = 12_000) {
  const { isOnline } = useNetworkStatus();
  const timedOut = ref(false);
  const hasProblem = computed(() => timedOut.value || (loading.value && !isOnline.value));
  const problemTitle = computed(() => isOnline.value ? 'text.8554357b1379' : 'text.b06e03be3a9c');
  const problemDescription = computed(() => isOnline.value
    ? 'text.89e4b1d19f7e'
    : 'text.5f0214b357d6'
  );
  let timer: number | null = null;

  function clearTimer() {
    if (timer !== null) window.clearTimeout(timer);
    timer = null;
  }

  function reset() {
    timedOut.value = false;
    clearTimer();
    if (loading.value) {
      timer = window.setTimeout(() => {
        timedOut.value = true;
      }, timeoutMs);
    }
  }

  watch(loading, reset, { immediate: true });
  onScopeDispose(clearTimer);

  return {
    hasProblem,
    isOnline,
    problemDescription,
    problemTitle,
    reset,
    timedOut,
  };
}
