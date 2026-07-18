<template>
  <div v-if="hasMore || loading || error" class="flex justify-center py-3">
    <AppButton
      variant="secondary"
      class="inline-flex h-9 w-fit items-center gap-2 rounded-full px-4 text-xs font-semibold"
      :disabled="loading"
      :aria-busy="loading"
      @click="emit('loadMore')"
    >
      <LoadingSpinner v-if="loading" :size="3.5" />
      {{ t(loading ? 'common.loading' : error ? 'common.retryLoading' : 'common.loadMore') }}
    </AppButton>
  </div>
</template>

<script setup lang="ts">
import AppButton from '@/components/ui/atoms/AppButton.vue';
import LoadingSpinner from '@/components/ui/atoms/LoadingSpinner.vue';
import { useI18n } from '@/i18n';

const { t } = useI18n();

withDefaults(defineProps<{
  error?: boolean;
  hasMore?: boolean;
  loading?: boolean;
}>(), {
  error: false,
  hasMore: false,
  loading: false,
});

const emit = defineEmits<{
  loadMore: [];
}>();
</script>
