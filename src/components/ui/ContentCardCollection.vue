<template>
  <div class="issue-table overflow-visible" role="list" :aria-label="t(listLabel)">
    <slot v-if="loading && empty" name="loading" />

    <div v-else-if="error" class="px-4 py-8 text-center text-sm text-error">
      {{ t(error) }}
    </div>

    <div v-else-if="empty" class="px-4 py-12 text-center text-sm text-ink-500 dark:text-ink-400">
      {{ t(emptyLabel) }}
    </div>

    <div v-else class="issue-card-grid" role="presentation">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/i18n';

const { t } = useI18n();

withDefaults(defineProps<{
  empty: boolean;
  emptyLabel: string;
  error?: string;
  listLabel: string;
  loading?: boolean;
}>(), {
  error: '',
  loading: false,
});

defineSlots<{
  default(): unknown;
  loading(): unknown;
}>();
</script>
